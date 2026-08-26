import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");

function exists(rel: string): boolean {
  return fs.existsSync(path.join(root, rel));
}

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf-8");
}

describe("Docker infrastructure", () => {
  describe("next.config.ts has standalone output", () => {
    it("contains output: 'standalone'", () => {
      const config = read("next.config.ts");
      expect(config).toContain("'standalone'");
    });
  });

  describe(".dockerignore", () => {
    it("exists", () => {
      expect(exists(".dockerignore")).toBe(true);
    });

    it("excludes node_modules", () => {
      const ignore = read(".dockerignore");
      expect(ignore).toContain("node_modules");
    });

    it("excludes .next", () => {
      const ignore = read(".dockerignore");
      expect(ignore).toContain(".next");
    });

    it("excludes .git", () => {
      const ignore = read(".dockerignore");
      expect(ignore).toContain(".git");
    });

    it("excludes test files", () => {
      const ignore = read(".dockerignore");
      expect(ignore).toContain("*.test.*");
    });
  });

  describe("Dockerfile", () => {
    it("exists", () => {
      expect(exists("Dockerfile")).toBe(true);
    });

    it("uses node:20-alpine as base", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain("node:20-alpine");
    });

    it("has 3 stages: deps, builder, runner", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain("AS deps");
      expect(dockerfile).toContain("AS builder");
      expect(dockerfile).toContain("AS runner");
    });

    it("installs production deps only in deps stage", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain("npm ci --omit=dev");
    });

    it("copies standalone output in runner stage", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain(".next/standalone");
    });

    it("copies static assets in runner stage", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain(".next/static");
    });

    it("copies public directory in runner stage", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain("public");
    });

    it("runs as non-root user", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain("USER ");
    });

    it("exposes port 3000", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain("EXPOSE 3000");
    });

    it("has a HEALTHCHECK instruction", () => {
      const dockerfile = read("Dockerfile");
      expect(dockerfile).toContain("HEALTHCHECK");
    });
  });

  describe("docker-compose.yml", () => {
    it("exists", () => {
      expect(exists("docker-compose.yml")).toBe(true);
    });

    it("defines an app service", () => {
      const compose = read("docker-compose.yml");
      expect(compose).toContain("app:");
    });

    it("publishes port 3000", () => {
      const compose = read("docker-compose.yml");
      expect(compose).toContain("3000");
    });

    it("uses env_file for environment variables", () => {
      const compose = read("docker-compose.yml");
      expect(compose).toContain("env_file");
    });
  });

  describe("docker-compose.prod.yml", () => {
    it("exists", () => {
      expect(exists("docker-compose.prod.yml")).toBe(true);
    });

    it("has restart policy", () => {
      const prod = read("docker-compose.prod.yml");
      expect(prod).toContain("restart:");
    });

    it("has logging configuration", () => {
      const prod = read("docker-compose.prod.yml");
      expect(prod).toContain("logging:");
    });
  });

  describe(".env.production.example", () => {
    it("exists", () => {
      expect(exists(".env.production.example")).toBe(true);
    });

    it("documents NEXT_PUBLIC_SUPABASE_URL", () => {
      const env = read(".env.production.example");
      expect(env).toContain("NEXT_PUBLIC_SUPABASE_URL");
    });

    it("documents NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
      const env = read(".env.production.example");
      expect(env).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    });

    it("documents SUPABASE_SERVICE_ROLE_KEY", () => {
      const env = read(".env.production.example");
      expect(env).toContain("SUPABASE_SERVICE_ROLE_KEY");
    });

    it("documents OPENAI_API_KEY", () => {
      const env = read(".env.production.example");
      expect(env).toContain("OPENAI_API_KEY");
    });

    it("documents INTERNAL_API_SECRET", () => {
      const env = read(".env.production.example");
      expect(env).toContain("INTERNAL_API_SECRET");
    });

    it("does NOT list GROQ_API_KEY", () => {
      const env = read(".env.production.example");
      expect(env).not.toContain("GROQ_API_KEY");
    });

    it("sets NODE_ENV to production", () => {
      const env = read(".env.production.example");
      expect(env).toContain("NODE_ENV=production");
    });
  });

  describe("package.json docker scripts", () => {
    it("has docker:dev script", () => {
      const pkg = JSON.parse(read("package.json"));
      expect(pkg.scripts["docker:dev"]).toBeDefined();
    });

    it("has docker:build script", () => {
      const pkg = JSON.parse(read("package.json"));
      expect(pkg.scripts["docker:build"]).toBeDefined();
    });

    it("has docker:prod script", () => {
      const pkg = JSON.parse(read("package.json"));
      expect(pkg.scripts["docker:prod"]).toBeDefined();
    });
  });
});
