import type { CollectionConfig } from 'payload'

/** Staff sign-in for the admin (SUMMIT-237, SUMMIT-257). */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Hiring manager', value: 'hiring-manager' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
