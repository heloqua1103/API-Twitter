import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express'
import formidable from 'formidable'

export const initFoler = () => {
  const uploadFolderPath = path.resolve('uploads/images')
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, { recursive: true })
  }
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads/images'),
    maxFiles: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024,
    filter: function({name, originalFilename, mimetype}) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if(!valid) {
        form.emit('error' as any, new Error('Invalid file type') as any)
      }
      return valid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if(!files.image) {
        return reject(new Error('No file uploaded'))
      }
      resolve(files)
    })
  })
}
