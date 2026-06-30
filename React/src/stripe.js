import { loadStripe } from '@stripe/stripe-js'

// Paste your own publishable key here from dashboard.stripe.com/test/apikeys
export const stripePromise = loadStripe('pk_test_51SDLeEBii4uKa9ScMovUKkvVwUZdS57qsr1PYi6E8ZeGFotOe7Nz2we3tM8G8ygz4OmaeUk7c7b5uszhQbuIHxJU004nSwRhgt')