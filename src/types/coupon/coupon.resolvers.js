import { Coupon } from './coupon.model'
import { AuthenticationError } from 'apollo-server'

const coupon = (_, args, ctx) => {
  if (!ctx.user) {
    throw new AuthenticationError()
  }
  return Coupon.findById(args.id)
    .lean()
    .exec()
}

const newCoupon = async (_, args, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new AuthenticationError()
  }
  const coupon = await Coupon.create({ ...args.input, createdBy: ctx.user._id })

  await ctx.pubsub.publish('COUPON_ADDED', { couponAdded: { coupon } })

  return coupon
}

const couponAdded = (_, args, ctx) => ({
  subscribe: () => ctx.pubsub.asyncIterator('COUPON_ADDED')
})

const coupons = (_, args, ctx) => {
  if (!ctx.user) {
    throw new AuthenticationError()
  }
  console.log({ ctx: ctx.pubsub })
  return Coupon.find({})
    .lean()
    .exec()
}

const updateCoupon = (_, args, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new AuthenticationError()
  }

  const update = args.input
  return Coupon.findByIdAndUpdate(args.id, update, { new: true })
    .lean()
    .exec()
}

const removeCoupon = (_, args, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new AuthenticationError()
  }

  return Coupon.findByIdAndRemove(args.id)
    .lean()
    .exec()
}

export default {
  Query: {
    coupons,
    coupon
  },
  Mutation: {
    newCoupon,
    updateCoupon,
    removeCoupon
  },
  Subscription: {
    couponAdded
  }
}
