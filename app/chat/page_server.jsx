// Server Component wrapper — 禁止prerender，直接导入client组件
export const dynamic = 'force-dynamic';

import ChatClient from './ChatClient';

export default function Page() {
  return <ChatClient />;
}
