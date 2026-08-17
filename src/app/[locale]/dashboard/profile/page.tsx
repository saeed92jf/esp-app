import { setRequestLocale } from 'next-intl/server';
import { ProfilePage } from '@/modules/profile/components/profile-page';

type Props = {
  params: { locale: string };
};

export default function Page({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <ProfilePage />;
}
