// import  type { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { User} from '../models/User.ts';
// import type {IUser} from '../models/User.ts';

// interface AuthenticatedRequest extends Request {
//   user?: IUser;
// }

// export const authMiddleware = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token =
//       req.cookies.token ||
//       req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || 'secret'
//     ) as { userId: string };

//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     req.user = user;
//     (req as any).token = token;

//     next();
//   } catch (error) {
//     console.error('Auth Middleware Error:', error);
//     res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };







  // try {
  //   // const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  //    const token = req.cookies.token;
  //   if (!token) {
  //     return res.status(401).json({ message: 'Authentication required' });
  //   }

  //   const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    
  //   let user;
  //   try {
  //     user = await User.findById(decoded.userId);
  //   } catch (err) {
  //     console.error('User findById error:', err);
  //     return res.status(401).json({ message: 'Invalid user ID format' });
  //   }

  //   if (!user) {
  //     return res.status(401).json({ message: 'User not found' });
  //   }

  //   req.user = user;
  //   (req as any).token = token;
  //   next();
  // } catch (error) {
  //   console.error('Auth Middleware Error:', error);
  //   res.status(401).json({ message: 'Invalid or expired token' });
  // }


import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.ts';
import type { IUser } from '../models/User.ts';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader); // 🔍 debug

    const token = authHeader && authHeader.split(" ")[1];

    console.log("TOKEN:", token); // 🔍 debug

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    console.log("DECODED:", decoded); // 🔍 debug

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error("JWT ERROR:", error.message); // 🔥 VERY IMPORTANT
    return res.status(401).json({ message: error.message });
  }
};


