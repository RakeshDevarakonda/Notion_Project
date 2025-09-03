export const generateUniqueTenantName = async () => {
  let tenantName;
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(Math.random() * 10000) + 1;
    tenantName = `Tenant-${randomNum}`;

    exists = await Tenant.exists({ name: tenantName });
  }

  return tenantName;
};
