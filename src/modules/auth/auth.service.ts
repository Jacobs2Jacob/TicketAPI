import jwt from "jsonwebtoken";
import { AppConfig } from "../../config/env";
import { AuthUser } from "../../types/auth";

export class AuthService {
  constructor(private cfg: AppConfig) {}

  issueToken(user: AuthUser): string {
    return jwt.sign(
      { name: user.name },
      this.cfg.jwtSecret,
      {
        subject: user.id,
        expiresIn: "1h",
      }
    );
  }
}
