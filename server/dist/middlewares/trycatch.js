const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next); //yha original controller execute ho rha h
        }
        catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    };
};
export default TryCatch;
// Request → incoming request,Frontend जो भेजता है वो यहाँ आता है eg: req.body,req.params, req.headers,req.user
// Response → response भेजने के लिए, Backend से frontend को data भेजने के लिए। eg: res.json(), res.status()
// NextFunction → next middleware call करने के लिए
// RequestHandler → Express controller/middleware का type
