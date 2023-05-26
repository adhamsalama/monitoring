import { Optional } from "../types";

export interface Cache {
  get(key: string): Promise<Optional<string>>;
  set(key: string, value: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
}
