import { AppError } from '../error/AppError.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsedRequest = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsedRequest.body) req.body = parsedRequest.body;
      if (parsedRequest.params) req.params = parsedRequest.params;

      if (parsedRequest.query) {
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, parsedRequest.query);
      }

      next();
    } catch (error) {
      if (error.name === 'ZodError' || error.issues) {
        const issues = error.issues || error.errors || [];

        const validationErrorMessage = issues
          .map((issue) => {
            const fieldPath = issue.path
              .filter((p) => p !== 'body' && p !== 'query' && p !== 'params')
              .join('.');

            return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message;
          })
          .join(', ');

        return next(new AppError(`Validation failed: ${validationErrorMessage}`, 400));
      }

      next(error);
    }
  };
};