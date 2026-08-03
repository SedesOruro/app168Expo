import fs from "fs";
import path from "path";
import { env } from "../config/env";

export interface StorageProvider {
  upload(filename: string, buffer: Buffer): Promise<string>;
  delete(filename: string): Promise<boolean>;
  exists(filename: string): Promise<boolean>;
  stream(filename: string): fs.ReadStream | NodeJS.ReadableStream;
  publicUrl(filename: string): string;
}

const sanitize = (filename: string): string => {
  const clean = path.posix.basename(filename.replace(/\\/g, "/"));
  if (!clean || clean === "." || clean === "..")
    throw new Error("Nombre de archivo invalido");
  return clean;
};

class LocalStorageProvider implements StorageProvider {
  private get localDir(): string {
    return path.resolve(process.cwd(), env.storage.localDir);
  }

  async upload(filename: string, buffer: Buffer): Promise<string> {
    const clean = sanitize(filename);
    await fs.promises.mkdir(this.localDir, { recursive: true });
    await fs.promises.writeFile(path.join(this.localDir, clean), buffer);
    return this.publicUrl(clean);
  }

  async delete(filename: string): Promise<boolean> {
    const target = path.join(this.localDir, sanitize(filename));
    if (!fs.existsSync(target)) return false;
    await fs.promises.unlink(target);
    return true;
  }

  async exists(filename: string): Promise<boolean> {
    return fs.existsSync(path.join(this.localDir, sanitize(filename)));
  }

  stream(filename: string): fs.ReadStream {
    return fs.createReadStream(path.join(this.localDir, sanitize(filename)));
  }

  publicUrl(filename: string): string {
    return `${env.storage.publicUrl}/${encodeURIComponent(sanitize(filename))}`;
  }
}

export const storageProvider: StorageProvider = new LocalStorageProvider();
