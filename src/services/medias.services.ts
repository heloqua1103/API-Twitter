import { UPLOAD_DIR } from './../constants/dir'
import { getNameFromFullName, handleUploadImage } from '~/utils/file'
import { Request, Response } from 'express'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'

class MediasService {
  async handleUploadImage(req: Request) {
    const file = await handleUploadImage(req)
    const newName = getNameFromFullName(file[0].newFilename)
    const newPath = path.resolve(UPLOAD_DIR,  `${newName}.jpg`)
    await sharp(file[0].filepath).jpeg().toFile(newPath)
    Promise.all([fsPromise.unlink(file[0].filepath), fsPromise.unlink(newPath)])
    return `http://localhost:3000/uploads/${newName}.jpg`
  }
}

const mediasService = new MediasService()
export default mediasService
