import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import mediasService from '~/services/medias.services'

export const uploadSingleImage = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadImage(req)
  return res.json(result)
}
