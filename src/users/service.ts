import { User } from "./types";
import { UserModel } from "./models/user";
import { CreateUserDto } from "./dto/create-user";
import bcrypt from "bcrypt";
import { Optional } from "../types";

export class UsersService {
  constructor(private userModel: typeof UserModel) {}

  async create(user: CreateUserDto): Promise<Omit<User, "password">> {
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    const createdUser = await this.userModel.create(user);
    return {
      _id: createdUser._id,
      email: createdUser.email,
      verified: createdUser.verified,
    };
  }

  async findByEmail(email: string): Promise<Omit<User, "password"> | null> {
    const user = await this.userModel.findOne({ email }).lean();
    console.log({ user });

    if (!user) {
      return null;
    }
    return { _id: user._id, email: user.email, verified: user.verified };
  }

  async findById(id: string): Promise<Optional<User>> {
    return this.userModel.findById(id);
  }

  async verifyUser(email: string): Promise<void> {
    await this.userModel.updateOne({ email }, { verified: true });
  }

  async authenticate(
    email: string,
    password: string
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return {
      _id: user._id,
      email: user.email,
      verified: user.verified,
    };
  }
}

export const usersService = new UsersService(UserModel);
