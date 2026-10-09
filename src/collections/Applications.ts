import type { CollectionConfig } from 'payload'

/**
 * The staff side of the careers funnel (SUMMIT-257): one row per application,
 * with a status, an owner and internal notes. Exercises a relationship to Jobs
 * and a relationship to Users, which generate join tables in the adapter.
 */
export const Applications: CollectionConfig = {
  slug: 'applications',
  admin: {
    useAsTitle: 'applicantName',
    defaultColumns: ['applicantName', 'job', 'status', 'createdAt'],
  },
  fields: [
    { name: 'applicantName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'job', type: 'relationship', relationTo: 'jobs', index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Screening', value: 'screening' },
        { label: 'Interviewing', value: 'interviewing' },
        { label: 'Offer', value: 'offer' },
        { label: 'Hired', value: 'hired' },
        { label: 'Not moving forward', value: 'rejected' },
      ],
    },
    { name: 'owner', type: 'relationship', relationTo: 'users' },
    {
      name: 'notes',
      type: 'array',
      fields: [
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'body', type: 'textarea', required: true },
        { name: 'at', type: 'date' },
      ],
    },
    /** Resume key in the private bucket. The file itself never lives in the database. */
    { name: 'resumeKey', type: 'text' },
  ],
}
