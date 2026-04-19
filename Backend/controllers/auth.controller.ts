import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, PlanType } from '../models/User.ts';

 

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      plan: PlanType.FREE,
    });

    const token = jwt.sign({ userId: user._id.toString() },
     process.env.JWT_SECRET as string,
      { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/' });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
  return res.status(400).json({ message: 'Missing fields' });
}


    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id.toString() },
     process.env.JWT_SECRET as string, 
     { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, 
      secure: false,
       sameSite: 'lax',
        path: '/' });

    return res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        plan: user.plan,
        payment_method: user.subscription?.paymentMethod,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Signin failed' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
      token: (req as any).token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        plan: user.plan,
        payment_method: user.subscription?.paymentMethod,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const signout = (req: Request, res: Response) => {
  res.clearCookie('token', { 
    httpOnly: true, 
    secure: false, 
    sameSite: 'lax',
    path: '/'
  });
  res.json({ success: true });
};
