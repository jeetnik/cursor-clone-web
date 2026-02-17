class CustomError extends Error {
    statusCode: number
    data: any
    success: boolean

    constructor(statusCode: number, message: string, data: any = null) {
        super(message)

        this.statusCode = statusCode
        this.data = data
        this.success = false

      Error.captureStackTrace(this,this.constructor)
    }
}
export {CustomError}