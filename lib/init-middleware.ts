// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export default function initMiddleware(
  middleware: (req: any, res: any, next: (result?: any) => void) => void
) {
  return (req: any, res: any) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
}
