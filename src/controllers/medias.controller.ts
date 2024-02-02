import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'

export const uploadSingleImage = async (req: Request, res: Response) => {
  console.log(path.resolve('uploads'))
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({
      message: 'Upload image success'
    })
  })
}
