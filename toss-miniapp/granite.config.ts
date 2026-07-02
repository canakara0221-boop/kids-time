import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'kids-time-left',
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'rsbuild dev',
      build: 'rsbuild build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '우리 아이와 남은 시간',
    // TODO: 콘솔에서 아이콘 이미지 업로드 후 URL로 교체 (조합 B 스카이블루 배경 권장)
    icon: 'https://static.toss.im/appsintoss/PLACEHOLDER_ICON.png',
    primaryColor: '#51AEEC', // onnydesign 조합 B 스카이블루
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'partner',
  },
});
