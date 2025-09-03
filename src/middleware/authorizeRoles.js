export const authorizeRoles = (...roles) => {
  return (resolverFn) => {
    return async (parent, args, context, info) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }
      if (!roles.includes(context?.user?.role)) {
        throw new Error("Unathorized Role");
      }
      return await resolverFn(parent, args, context, info);
    };
  };
};
