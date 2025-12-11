import type { FastifyInstance } from "fastify";
import stripe from "~/stripe";

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/", async (_request, reply) => {
    const customerEmail = (await stripe.customers.list()).data[0]?.email ?? "";
    return reply.view(
      "index.ejs",
      { title: "Welcome", customerEmail },
      { layout: "_layout.ejs" },
    );
  });
}
