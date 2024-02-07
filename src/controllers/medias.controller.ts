import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime-types'

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadImage(req)
  return res.json({ result: url, message: USERS_MESSAGES.UPLOAD_SUCCESS })
}

export const serveImageController = async (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send(err.message)
    }
  })
}

export const serveSegmentController = async (req: Request, res: Response) => {
  const { id, v, segment } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      res.status((err as any).status).send(err.message)
    }
  })
}

export const serveM3u8Controller = async (req: Request, res: Response) => {
  const { id } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      res.status((err as any).status).send(err.message)
    }
  })
}

export const serveVideoStreamController = async (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // 1MB = 10^6 bytes

  // Dung luong video
  const videoSize = fs.statSync(videoPath).size

  // Dung luong video cho moi phan doan
  const chunkSize = 10 ** 6

  // Vi tri bat dau cua phan doan
  const start = Number(range.replace(/\D/g, ''))

  // Vi tri ket thuc cua phan doan
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1
  const contentType = mime.lookup(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadVideo(req)
  return res.json({ result: url, message: USERS_MESSAGES.UPLOAD_SUCCESS })
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadVideoHLS(req)
  return res.json({ result: url, message: USERS_MESSAGES.UPLOAD_SUCCESS })
}

export const videoStatusController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await mediasService.getVideoStatus(id as string)
  return res.json({ result: result, message: USERS_MESSAGES.GET_VIDEO_STATUS_SUCCESS })
}
