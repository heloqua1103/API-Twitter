import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import { handleUploadImage } from '~/utils/file'

export const uploadSingleImage = async (req: Request, res: Response) => {
  const data = await handleUploadImage(req)
  return res.json({ result: data })
}
