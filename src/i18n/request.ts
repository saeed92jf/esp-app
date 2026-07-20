import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

function deepMerge(...objects: any[]) {
  const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      if (isObject(prev[key]) && isObject(obj[key])) {
        prev[key] = deepMerge(prev[key], obj[key]);
      } else {
        prev[key] = obj[key];
      }
    });
    return prev;
  }, {});
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const rootMessages = (await import(`../../messages/${locale}.json`)).default;
  
  const loadModuleMsg = async (path: string) => 
    (await import(`../modules/${path}/messages/${locale}.json`).catch(() => ({ default: {} }))).default;

  const flowMessages = await loadModuleMsg('claude-flow');
  const dashboardMessages = await loadModuleMsg('dashboard');
  const authMessages = await loadModuleMsg('auth');
  const homeMessages = await loadModuleMsg('home');
  const welcomeMessages = await loadModuleMsg('welcome');
  const aparatMessages = await loadModuleMsg('aparat');
  const heroFlowMessages = await loadModuleMsg('hero-flow');

  return {
    locale,
    messages: deepMerge(
      rootMessages,
      flowMessages,
      dashboardMessages,
      authMessages,
      homeMessages,
      welcomeMessages,
      aparatMessages,
      heroFlowMessages
    )
  };
});