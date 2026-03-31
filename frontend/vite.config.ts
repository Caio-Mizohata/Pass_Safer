import * as ngrok from "@ngrok/ngrok";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


const createAllowedHosts = (env: Record<string, string>): string[] => {
  // Atualizado para incluir o '.ngrok-free.app', padrão atual da camada gratuita
  const allowedHosts = new Set([
    "localhost", 
    "127.0.0.1", 
    ".ngrok-free.dev", 
    ".ngrok-free.app", 
    ".ngrok.app", 
    ".ngrok.io"
  ]);
  const configuredDomain = env.NGROK_DOMAIN?.trim();

  if (configuredDomain) {
    const normalizedDomain = configuredDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    if (normalizedDomain) {
      allowedHosts.add(normalizedDomain);
    }
  }

  return Array.from(allowedHosts);
};

const createNgrokPlugin = (env: Record<string, string>): Plugin => {
  let listener: ngrok.Listener | null = null;

  return {
    name: "vite-ngrok-tunnel",
    apply: "serve",
    configureServer(server) {
      const token = env.NGROK_AUTH_TOKEN;

      if (!token) {
        server.config.logger.info("[ngrok] NGROK_AUTH_TOKEN não definido. Túnel desabilitado.");
        return;
      }

      const httpServer = server.httpServer;

      if (!httpServer) {
        server.config.logger.warn("[ngrok] Servidor HTTP do Vite não disponível. Túnel desabilitado.");
        return;
      }

      httpServer.once("listening", () => {
        void (async () => {
          try {
            const address = httpServer.address();
            const fallbackPort = server.config.server.port ?? 8080;
            const port = typeof address === "object" && address ? address.port : fallbackPort;

            listener = await ngrok.forward({
              addr: port,
              authtoken: token,
              domain: env.NGROK_DOMAIN || undefined,
            });

            const publicUrl = listener.url();

            if (publicUrl) {
              process.env.FRONTEND_NGROK_URL = publicUrl;
            }

            server.config.logger.info(`\n[ngrok] Túnel ativo em ${publicUrl ?? "url indisponível"}\n`);
          } catch (error) {
            server.config.logger.error(`[ngrok] Falha ao iniciar túnel: ${String(error)}`);
          }
        })();
      });

      httpServer.once("close", () => {
        if (listener) {
          void listener.close();
          listener = null;
          server.config.logger.info("[ngrok] Túnel encerrado com sucesso.");
        }
      });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = env.VITE_BACKEND_TARGET?.trim() || "http://localhost:3001";

  // Verifique se o token de autenticação do ngrok está presente para determinar se esta em um ambiente ngrok
  const isNgrokEnv = !!env.NGROK_AUTH_TOKEN;

  return {
    server: {
      // host: true (equivale a 0.0.0.0) garante acesso em redes Docker e locais
      host: true, 
      port: 8080,
      allowedHosts: createAllowedHosts(env),
      cors: true, // (true) Evita bloqueios de fontes do Vite pelo ngrok
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          ws: true, // Habilita proxy para WebSocket (HMR)
        },
      },
      hmr: {
        overlay: false,
        // Se estiver rodando com ngrok, o tráfego do WebSocket (HMR) precisa fluir pela porta 443 (WSS)
        ...(isNgrokEnv ? { clientPort: 443 } : {}),
      },
    },
    plugins: [react(), createNgrokPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});
