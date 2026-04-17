import { redirect } from 'next/navigation';

interface InvitePageProps {
  params: { code: string };
}

export default function InvitePage({ params }: InvitePageProps) {
  redirect(`/register?ref=${params.code}`);
}
