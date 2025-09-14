import {defineField, defineType} from 'sanity'

export const ratingType = defineType({
  name: 'rating',
  title: 'Rating',
  type: 'document',
  fields: [
    defineField({
      name: 'trip',
      title: 'Related Trip',
      type: 'reference',
      to: [{type: 'trip'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviewer',
      title: 'Reviewer (User who gives the rating)',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviewee',
      title: 'Reviewee (User who receives the rating)',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Star Rating',
      type: 'number',
      validation: (rule) => rule.required().min(1).max(5),
      description: 'Rating from 1 to 5 stars',
    }),
    defineField({
      name: 'reviewType',
      title: 'Review Type',
      type: 'string',
      options: {
        list: [
          {title: 'Driver Review (by Passenger)', value: 'driver_review'},
          {title: 'Passenger Review (by Driver)', value: 'passenger_review'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'comment',
      title: 'Review Comment',
      type: 'text',
      rows: 4,
      description: 'Optional detailed review comment',
    }),
    defineField({
      name: 'reviewCategories',
      title: 'Review Categories',
      type: 'object',
      description: 'Detailed category ratings',
      fields: [
        {
          name: 'punctuality',
          title: 'Punctuality',
          type: 'number',
          validation: (rule) => rule.min(1).max(5),
        },
        {
          name: 'communication',
          title: 'Communication',
          type: 'number',
          validation: (rule) => rule.min(1).max(5),
        },
        {
          name: 'cleanliness',
          title: 'Cleanliness',
          type: 'number',
          validation: (rule) => rule.min(1).max(5),
          hidden: ({parent}) => parent?.reviewType !== 'driver_review',
        },
        {
          name: 'drivingSkill',
          title: 'Driving Skill',
          type: 'number',
          validation: (rule) => rule.min(1).max(5),
          hidden: ({parent}) => parent?.reviewType !== 'driver_review',
        },
        {
          name: 'politeness',
          title: 'Politeness',
          type: 'number',
          validation: (rule) => rule.min(1).max(5),
        },
        {
          name: 'reliability',
          title: 'Reliability',
          type: 'number',
          validation: (rule) => rule.min(1).max(5),
        },
      ],
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Anonymous Review',
      type: 'boolean',
      initialValue: false,
      description: 'Hide reviewer name from public view',
    }),
    defineField({
      name: 'isPublic',
      title: 'Public Review',
      type: 'boolean',
      initialValue: true,
      description: 'Show this review publicly on profiles',
    }),
    defineField({
      name: 'tripDate',
      title: 'Trip Date',
      type: 'date',
      validation: (rule) => rule.required(),
      description: 'Date when the trip occurred',
    }),
    defineField({
      name: 'createdAt',
      title: 'Review Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'status',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Hidden', value: 'hidden'},
          {title: 'Reported', value: 'reported'},
        ],
      },
      initialValue: 'active',
    }),
  ],
  orderings: [
    {
      title: 'Review Date, New',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
    {
      title: 'Rating, High',
      name: 'ratingDesc',
      by: [{field: 'rating', direction: 'desc'}],
    },
    {
      title: 'Rating, Low',
      name: 'ratingAsc',
      by: [{field: 'rating', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'reviewee.name',
      reviewer: 'reviewer.name',
      rating: 'rating',
      reviewType: 'reviewType',
      tripDate: 'tripDate',
    },
    prepare(selection) {
      const {title, reviewer, rating, reviewType, tripDate} = selection
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
      const type = reviewType === 'driver_review' ? 'Driver' : 'Passenger'
      return {
        title: `${stars} ${type}: ${title || 'Unknown'}`,
        subtitle: `By ${reviewer || 'Unknown'} • ${tripDate}`,
      }
    },
  },
})
