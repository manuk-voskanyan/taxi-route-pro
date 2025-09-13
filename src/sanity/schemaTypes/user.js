import {defineField, defineType} from 'sanity'

export const userType = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'password',
      title: 'Password',
      type: 'string',
      validation: (rule) => rule.required().min(6),
      hidden: true, // Hide from Sanity Studio UI
    }),
    defineField({
      name: 'userType',
      title: 'User Type',
      type: 'string',
      options: {
        list: [
          {title: 'Driver', value: 'driver'},
          {title: 'Passenger', value: 'passenger'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'driverInfo',
      title: 'Driver Information',
      type: 'object',
      hidden: ({document}) => document?.userType !== 'driver',
      fields: [
        {
          name: 'licenseNumber',
          title: 'Driver License Number',
          type: 'string',
        },
        {
          name: 'carModel',
          title: 'Car Model',
          type: 'string',
        },
        {
          name: 'carColor',
          title: 'Car Color',
          type: 'string',
        },
        {
          name: 'plateNumber',
          title: 'License Plate Number',
          type: 'string',
        },
        {
          name: 'company',
          title: 'Company Name',
          type: 'string',
          description: 'Optional company affiliation'
        },
        {
          name: 'rating',
          title: 'Driver Rating',
          type: 'number',
          validation: (rule) => rule.min(0).max(5),
        },
        {
          name: 'carImages',
          title: 'Car Images',
          type: 'array',
          of: [
            {
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                  options: {
                    isHighlighted: false // Optional caption field
                  }
                }
              ]
            },
          ],
          options: {
            layout: 'grid',
          },
          validation: (rule) => rule.max(5),
        },
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Account Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      media: 'avatar',
    },
  },
})
