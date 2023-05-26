import Router from "express";
import { checksService } from "./service";
import { createCheckDTOSchema } from "./dto/create-check";

const router = Router();
router.get("/tags", async (req, res) => {
  const { _id: userId } = req.user!;
  let tags: string[] | null = null;
  if (req.query.tags instanceof Array && req.query.tags?.length > 0) {
    tags = req.query.tags.map((tag) => tag.toString().toLocaleLowerCase());
  } else if (typeof req.query.tags === "string") {
    tags = [req.query.tags.toLocaleLowerCase()];
  }

  const checks = await checksService.groupByTags(userId, tags);
  return res.json(checks);
});

router.get("/reports", async (req, res) => {
  const { _id: userId } = req.user!;
  let tags: string[] = [];
  if (req.query.tags instanceof Array && req.query.tags?.length > 0) {
    tags = req.query.tags.map((tag) => tag.toString().toLocaleLowerCase());
  } else if (typeof req.query.tags === "string") {
    tags = [req.query.tags.toLocaleLowerCase()];
  }
  const reports = await checksService.getReport(userId, tags);
  return res.json(reports);
});
router.post("/", async (req, res) => {
  const createCheckDTO = createCheckDTOSchema.safeParse(req.body);
  if (!createCheckDTO.success) {
    return res.status(400).json(createCheckDTO.error);
  }
  const check = await checksService.create(req.user!._id, createCheckDTO.data);
  return res.status(201).json(check);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user!;
  const deletedCheck = await checksService.deleteById(id, userId);
  if (!deletedCheck) {
    return res.status(404).end();
  }
  return res.status(204).end();
});

router.get("/", async (req, res) => {
  const { _id: userId } = req.user!;
  const checks = await checksService.getAll(userId);
  return res.json(checks);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user!;
  const check = await checksService.getById(id, userId);
  if (!check) {
    return res.status(404).end();
  }
  return res.json(check);
});

// I prefer to use PUT for updating resources, but PATCH is also a valid option
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user!;
  const UpdateCheckDTO = createCheckDTOSchema.safeParse(req.body);
  if (!UpdateCheckDTO.success) {
    return res.status(400).json(UpdateCheckDTO.error);
  }
  const update = UpdateCheckDTO.data;
  const updatedCheck = await checksService.updateById(id, userId, update);
  if (!updatedCheck) {
    return res.status(404).end();
  }
  return res.json(updatedCheck);
});

export { router };
