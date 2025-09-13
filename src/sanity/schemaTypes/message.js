import {defineField, defineType} from 'sanity'

export const messageType = defineType({
  name: 'message',
  title: 'Message',
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
      name: 'sender',
      title: 'Sender',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'receiver',
      title: 'Receiver',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Message Content',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'messageType',
      title: 'Message Type',
      type: 'string',
      options: {
        list: [
          {title: 'Text', value: 'text'},
          {title: 'Booking Request', value: 'booking_request'},
          {title: 'Booking Confirmation', value: 'booking_confirmation'},
          {title: 'Trip Update', value: 'trip_update'},
        ],
      },
      initialValue: 'text',
    }),
    defineField({
      name: 'isRead',
      title: 'Is Read',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'attachments',
      title: 'Attachments',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Created At, New',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
    {
      title: 'Created At, Old',
      name: 'createdAtAsc',
      by: [{field: 'createdAt', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'content',
      sender: 'sender.name',
      date: 'createdAt',
    },
    prepare(selection) {
      const {title, sender, date} = selection
      return {
        title: title?.slice(0, 50) + (title?.length > 50 ? '...' : ''),
        subtitle: `From: ${sender} • ${new Date(date).toLocaleDateString()}`,
      }
    },
  },
})
