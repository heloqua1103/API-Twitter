import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'nguyenhieu1103' && password === '123456') {
    res.status(200).json({ message: 'Login success' })
  } else {
    res.status(400).json({ message: 'Login fail' })
  }
}

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const result = await usersService.register({ email, password })
    return res.json({ message: 'Register success', result })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Register fail' })
  }
}
