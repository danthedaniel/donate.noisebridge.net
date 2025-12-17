import Stripe from "stripe";
import config from "~/config";

const stripe = new Stripe(config.stripeSecretKey);

export default stripe;
