// Returns the visitor's country (from their IP address) so the cart can
// pre-select where the order ships.
export default async (req, context) => {
  return Response.json(
    { country: context.geo?.country?.code || null },
    { headers: { 'cache-control': 'private, no-store' } }
  );
};
