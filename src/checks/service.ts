import { PipelineStage } from "mongoose";
import { Optional } from "../types";
import { CreateCheckDTO } from "./dto/create-check";
import { UpdateCheckDTO } from "./dto/update-check";
import { CheckModel } from "./models/check";
import { UrlCheck } from "./types";
import { loggingService, LoggingService } from "../monitoring/service";
export class ChecksService {
  constructor(
    private checkModel: typeof CheckModel,
    private logginService: LoggingService
  ) {}
  async create(
    userId: string,
    createCheckDTO: CreateCheckDTO
  ): Promise<UrlCheck> {
    createCheckDTO.tags = createCheckDTO.tags?.map((tag) =>
      tag.toLocaleLowerCase()
    );
    const check = await this.checkModel.create({ ...createCheckDTO, userId });
    this.logginService.monitor(check);
    return check.toObject();
  }

  async getAll(userId: string): Promise<UrlCheck[]> {
    return this.checkModel.find({ userId }).lean();
  }

  async getById(id: string, userId: string): Promise<Optional<UrlCheck>> {
    return this.checkModel.findOne({ _id: id, userId }).lean();
  }

  async deleteById(id: string, userId: string): Promise<Optional<UrlCheck>> {
    const deletedCheck = await this.checkModel
      .findOneAndDelete({
        _id: id,
        userId,
      })
      .lean();
    if (deletedCheck) {
      this.logginService.stopMonitoring(deletedCheck);
    }
    return deletedCheck;
  }

  async updateById(
    id: string,
    userId: string,
    update: UpdateCheckDTO
  ): Promise<Optional<UrlCheck>> {
    const updatedCheck = await this.checkModel
      .findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true })
      .lean();
    if (updatedCheck) {
      this.logginService.monitor(updatedCheck);
    }
    return updatedCheck;
  }

  async resumeMonitoring() {
    const checks = await this.checkModel.find({}).lean();
    checks.forEach((check) => {
      this.logginService.monitor(check);
    });
  }
  async groupByTags(
    userId: string,
    tags: string[] | null = null
  ): Promise<Record<string, number>[]> {
    const pipeline: PipelineStage[] = [
      { $match: { userId, ...(tags?.length && { tags: { $in: tags } }) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $push: "$$ROOT" } } },
    ];
    if (tags?.length) {
      pipeline.splice(2, 0, { $match: { tags: { $in: tags } } });
    }

    const checks: Record<string, number>[] = (
      await this.checkModel.aggregate(pipeline)
    ).map(({ _id, count }) => ({ [_id]: count }));

    return checks;
  }

  async getReport(userId: string, tags?: string[]) {
    return this.checkModel.aggregate([
      { $match: { userId, ...(tags?.length && { tags: { $in: tags } }) } },
      {
        $addFields: {
          _id: {
            $toString: "$_id",
          },
        },
      },
      {
        $lookup: {
          from: "logs",
          localField: "_id",
          foreignField: "checkId",
          as: "logs",
        },
      },
      {
        $addFields: {
          outages: {
            $size: {
              $filter: {
                input: "$logs",
                as: "log",
                cond: {
                  $eq: ["$$log.status", "DOWN"],
                },
              },
            },
          },
          status: {
            $last: "$logs.status",
          },
          downtime: {
            $reduce: {
              input: "$logs",
              initialValue: 0,
              in: {
                $cond: {
                  if: {
                    $eq: ["$$this.status", "DOWN"],
                  },
                  then: {
                    $add: ["$$this.intervalInSeconds", "$$value"],
                  },
                  else: {
                    $add: [0, "$$value"],
                  },
                },
              },
            },
          },
          uptime: {
            $reduce: {
              input: "$logs",
              initialValue: 0,
              in: {
                $cond: {
                  if: {
                    $eq: ["$$this.status", "UP"],
                  },
                  then: {
                    $add: ["$$this.intervalInSeconds", "$$value"],
                  },
                  else: {
                    $add: [0, "$$value"],
                  },
                },
              },
            },
          },
          responseTime: { $avg: "$logs.responseTime" },
        },
      },
      {
        $addFields: {
          availability: {
            $multiply: [
              {
                $divide: [
                  "$uptime",
                  {
                    $add: ["$uptime", "$downtime"],
                  },
                ],
              },
              100,
            ],
          },
        },
      },
    ]);
  }
}

export const checksService = new ChecksService(CheckModel, loggingService);
