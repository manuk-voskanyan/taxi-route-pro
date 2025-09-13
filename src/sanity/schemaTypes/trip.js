import {defineField, defineType} from 'sanity'

export const tripType = defineType({
  name: 'trip',
  title: 'Trip',
  type: 'document',
  fields: [
    defineField({
      name: 'driver',
      title: 'Driver',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fromCity',
      title: 'Departure City',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'toCity',
      title: 'Destination City',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'departureDate',
      title: 'Departure Date',
      type: 'date',
      validation: (rule) => rule.required().min(new Date().toISOString().split('T')[0]),
    }),
    defineField({
      name: 'departureTime',
      title: 'Departure Time',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'availableSeats',
      title: 'Available Seats',
      type: 'number',
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: 'totalSeats',
      title: 'Total Seats',
      type: 'number',
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: 'pricePerSeat',
      title: 'Price per Seat',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          {title: 'USD', value: 'USD'},
          {title: 'EUR', value: 'EUR'},
          {title: 'AMD', value: 'AMD'},
          {title: 'RUB', value: 'RUB'},
        ],
      },
      initialValue: 'USD',
    }),
    defineField({
      name: 'description',
      title: 'Trip Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'stops',
      title: 'Intermediate Stops',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'status',
      title: 'Trip Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Full', value: 'full'},
          {title: 'Completed', value: 'completed'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'passengers',
      title: 'Booked Passengers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'passenger',
              title: 'Passenger',
              type: 'reference',
              to: [{type: 'user'}],
            },
            {
              name: 'seatsBooked',
              title: 'Seats Booked',
              type: 'number',
              validation: (rule) => rule.required().min(1),
            },
            {
              name: 'bookingDate',
              title: 'Booking Date',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
            {
              name: 'status',
              title: 'Booking Status',
              type: 'string',
              options: {
                list: [
                  {title: 'Pending', value: 'pending'},
                  {title: 'Confirmed', value: 'confirmed'},
                  {title: 'Cancelled', value: 'cancelled'},
                ],
              },
              initialValue: 'pending',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'fromCity',
      subtitle: 'toCity',
      date: 'departureDate',
      status: 'status',
    },
    prepare(selection) {
      const {title, subtitle, date, status} = selection
      return {
        title: `${title} → ${subtitle}`,
        subtitle: `${date} • ${status}`,
      }
    },
  },
})
