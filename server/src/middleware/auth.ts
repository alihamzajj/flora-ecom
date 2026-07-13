import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: "Access denied. No token provided." });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}
