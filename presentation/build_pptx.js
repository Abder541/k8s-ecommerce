const pptxgen = require("pptxgenjs");

// ---------- Palette (cloud / Kubernetes) ----------
const NAVY = "0B1F3A";   // fond sombre (titre, conclusion)
const NAVY2 = "12305C";  // navy clair
const K8S  = "326CE5";   // bleu Kubernetes (accent principal)
const TEAL = "00B4D8";   // accent secondaire
const INK  = "1A2233";   // texte fonce
const SLATE= "5B6B7F";   // texte attenue
const LIGHT= "F4F6FA";   // fond clair
const CARD = "FFFFFF";   // cartes
const LINE = "DDE3EC";   // bordures
const GREEN= "16A34A";   // succes
const AMBER= "D97706";   // attention

const HF = "Trebuchet MS"; // header font
const BF = "Calibri";      // body font
const MF = "Consolas";     // mono

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
const PW = 13.33, PH = 7.5;
pres.author = "Equipe K8s E-Commerce";
pres.title = "Deploiement d'une application E-Commerce sur Kubernetes";

const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.16 });

// ---------- Helpers ----------
function header(slide, kicker, title) {
  slide.background = { color: LIGHT };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: PW, h: 1.15, fill: { color: NAVY } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.15, w: PW, h: 0.06, fill: { color: K8S } });
  slide.addText(kicker.toUpperCase(), { x: 0.6, y: 0.18, w: 11, h: 0.3, fontFace: HF, fontSize: 12, color: TEAL, charSpacing: 3, bold: true });
  slide.addText(title, { x: 0.6, y: 0.44, w: 12.1, h: 0.62, fontFace: HF, fontSize: 26, color: "FFFFFF", bold: true });
}
function footer(slide, n) {
  slide.addText("K8s E-Commerce  |  Projet DevOps", { x: 0.6, y: 7.06, w: 7, h: 0.3, fontFace: BF, fontSize: 9, color: SLATE });
  slide.addText(String(n), { x: 12.5, y: 7.06, w: 0.5, h: 0.3, fontFace: BF, fontSize: 9, color: SLATE, align: "right" });
}
function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || CARD }, line: { color: LINE, width: 1 }, shadow: shadow() });
}
function chip(slide, x, y, label, color) {
  const w = 0.34 + label.length * 0.105;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.36, rectRadius: 0.18, fill: { color: color || K8S } });
  slide.addText(label, { x, y, w, h: 0.36, fontFace: HF, fontSize: 11, color: "FFFFFF", bold: true, align: "center", valign: "middle" });
  return w;
}

let N = 0;

// ============================================================
// SLIDE 1 - TITRE
// ============================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  // motif: blocs (conteneurs) en haut a droite
  for (let i = 0; i < 6; i++) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.4 + (i % 3) * 0.95, y: 0.6 + Math.floor(i / 3) * 0.95, w: 0.78, h: 0.78, rectRadius: 0.08, fill: { color: i % 2 ? K8S : NAVY2 }, line: { color: TEAL, width: 1 } });
  }
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.45, w: 0.14, h: 2.2, fill: { color: K8S } });
  s.addText("PROJET DEVOPS  |  KUBERNETES", { x: 0.95, y: 2.5, w: 10, h: 0.4, fontFace: HF, fontSize: 14, color: TEAL, charSpacing: 3, bold: true });
  s.addText("Deploiement d'une application\nE-Commerce sur Kubernetes", { x: 0.92, y: 2.95, w: 11.5, h: 1.7, fontFace: HF, fontSize: 40, color: "FFFFFF", bold: true, lineSpacingMultiple: 1.02 });
  s.addText("Conteneurisation Docker  |  Orchestration K8s  |  Persistance  |  Observabilite", { x: 0.95, y: 4.75, w: 11.5, h: 0.4, fontFace: BF, fontSize: 16, color: "CADCFC" });
  // bandeau equipe
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 6.35, w: PW, h: 1.15, fill: { color: NAVY2 } });
  s.addText([
    { text: "Equipe : ", options: { bold: true, color: TEAL } },
    { text: "[Membre 1]  |  [Membre 2]  |  [Membre 3]", options: { color: "FFFFFF" } }
  ], { x: 0.95, y: 6.55, w: 8.5, h: 0.4, fontFace: BF, fontSize: 14 });
  s.addText("Soutenance - Juin 2026", { x: 9.2, y: 6.55, w: 3.2, h: 0.4, fontFace: BF, fontSize: 13, color: "CADCFC", align: "right" });
})();

// ============================================================
// SLIDE 2 - OBJECTIF & ARCHITECTURE IMPOSEE
// ============================================================
(() => {
  N = 2; const s = pres.addSlide();
  header(s, "Contexte", "Objectif du projet");
  // gauche : objectif
  card(s, 0.6, 1.5, 6.0, 2.4);
  s.addText("Mission", { x: 0.85, y: 1.65, w: 5.5, h: 0.4, fontFace: HF, fontSize: 16, color: K8S, bold: true });
  s.addText([
    { text: "Concevoir, conteneuriser et deployer une application e-commerce complete dans un cluster Kubernetes.", options: { breakLine: true, bullet: true } },
    { text: "3 composants : Frontend, Backend (API), Base de donnees.", options: { breakLine: true, bullet: true } },
    { text: "Communication, persistance et bonnes pratiques K8s.", options: { bullet: true } }
  ], { x: 0.85, y: 2.1, w: 5.5, h: 1.7, fontFace: BF, fontSize: 13.5, color: INK, paraSpaceAfter: 8 });

  // droite : architecture imposee (table Pod)
  card(s, 6.9, 1.5, 5.8, 2.4);
  s.addText("Architecture imposee", { x: 7.15, y: 1.65, w: 5.3, h: 0.4, fontFace: HF, fontSize: 16, color: K8S, bold: true });
  s.addTable([
    [{ text: "Pod", options: { bold: true, color: "FFFFFF", fill: { color: NAVY }, fontSize: 13 } }, { text: "Contenu", options: { bold: true, color: "FFFFFF", fill: { color: NAVY }, fontSize: 13 } }],
    [{ text: "Pod 1", options: { bold: true, color: K8S } }, "Frontend uniquement"],
    [{ text: "Pod 2", options: { bold: true, color: K8S } }, "Backend + Base de donnees"],
    [{ text: "Pod 3", options: { bold: true, color: TEAL } }, "Observabilite (bonus)"]
  ], { x: 7.15, y: 2.15, w: 5.3, colW: [1.4, 3.9], rowH: [0.36, 0.36, 0.36, 0.36], fontFace: BF, fontSize: 12.5, color: INK, border: { pt: 1, color: LINE }, valign: "middle" });

  // bas : criteres / livrables
  card(s, 0.6, 4.15, 12.1, 2.55);
  s.addText("Livrables & criteres d'evaluation", { x: 0.85, y: 4.3, w: 11.6, h: 0.4, fontFace: HF, fontSize: 16, color: K8S, bold: true });
  const crit = [["30%", "Fonctionnement"], ["20%", "Qualite YAML K8s"], ["15%", "Architecture"], ["15%", "Volumes & Services"], ["10%", "README"], ["10%", "Soutenance"]];
  crit.forEach((c, i) => {
    const x = 0.85 + i * 1.97;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 4.8, w: 1.8, h: 1.7, fill: { color: LIGHT }, line: { color: LINE, width: 1 } });
    s.addText(c[0], { x, y: 4.95, w: 1.8, h: 0.6, fontFace: HF, fontSize: 26, color: K8S, bold: true, align: "center" });
    s.addText(c[1], { x: x + 0.1, y: 5.6, w: 1.6, h: 0.8, fontFace: BF, fontSize: 12, color: INK, align: "center", valign: "top" });
  });
  footer(s, N);
})();

// ============================================================
// SLIDE 3 - ARCHITECTURE DE LA SOLUTION (diagramme)
// ============================================================
(() => {
  N = 3; const s = pres.addSlide();
  header(s, "Conception", "Architecture de la solution");

  // Cadre cluster
  s.addShape(pres.shapes.RECTANGLE, { x: 3.0, y: 1.45, w: 9.9, h: 5.25, fill: { color: "FFFFFF" }, line: { color: K8S, width: 1.5 } });
  s.addText("Cluster Kubernetes  -  namespace: ecommerce", { x: 3.15, y: 1.5, w: 9.6, h: 0.35, fontFace: HF, fontSize: 12.5, color: K8S, bold: true });

  // Utilisateur
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 3.0, w: 2.0, h: 1.2, rectRadius: 0.1, fill: { color: NAVY } });
  s.addText("Navigateur\nutilisateur", { x: 0.5, y: 3.0, w: 2.0, h: 1.2, fontFace: BF, fontSize: 13, color: "FFFFFF", align: "center", valign: "middle", bold: true });
  s.addShape(pres.shapes.LINE, { x: 2.5, y: 3.6, w: 0.5, h: 0, line: { color: SLATE, width: 2, endArrowType: "triangle" } });
  s.addText("NodePort 30080", { x: 2.35, y: 3.15, w: 1.0, h: 0.3, fontFace: BF, fontSize: 8.5, color: SLATE, align: "center" });

  // Pod 1 - frontend
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.3, y: 2.05, w: 3.0, h: 1.5, rectRadius: 0.08, fill: { color: LIGHT }, line: { color: K8S, width: 1.25 } });
  s.addText("Pod 1 - Frontend", { x: 3.4, y: 2.15, w: 2.8, h: 0.3, fontFace: HF, fontSize: 12, color: K8S, bold: true });
  s.addText([{ text: "Nginx + React (x2 replicas)", options: { breakLine: true, bullet: true } }, { text: "proxy /api  ->  backend", options: { bullet: true } }], { x: 3.45, y: 2.5, w: 2.8, h: 0.95, fontFace: BF, fontSize: 10.5, color: INK });

  // fleche pod1 -> pod2 (ClusterIP)
  s.addShape(pres.shapes.LINE, { x: 4.8, y: 3.55, w: 0, h: 0.55, line: { color: TEAL, width: 2, endArrowType: "triangle" } });
  s.addText("backend-service:3000 (ClusterIP)", { x: 4.95, y: 3.62, w: 3.2, h: 0.3, fontFace: BF, fontSize: 8.5, color: TEAL });

  // Pod 2 - backend + mongo
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.3, y: 4.15, w: 3.4, h: 2.0, rectRadius: 0.08, fill: { color: LIGHT }, line: { color: K8S, width: 1.25 } });
  s.addText("Pod 2 - Backend + DB", { x: 3.4, y: 4.25, w: 3.2, h: 0.3, fontFace: HF, fontSize: 12, color: K8S, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.45, y: 4.62, w: 3.1, h: 0.5, fill: { color: "FFFFFF" }, line: { color: LINE, width: 1 } });
  s.addText("backend Node.js  : 3000", { x: 3.5, y: 4.62, w: 3.0, h: 0.5, fontFace: MF, fontSize: 9.5, color: INK, valign: "middle" });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.45, y: 5.18, w: 3.1, h: 0.5, fill: { color: "FFFFFF" }, line: { color: LINE, width: 1 } });
  s.addText("mongodb        : 27017", { x: 3.5, y: 5.18, w: 3.0, h: 0.5, fontFace: MF, fontSize: 9.5, color: INK, valign: "middle" });
  s.addText("communication via localhost", { x: 3.5, y: 5.7, w: 3.1, h: 0.3, fontFace: BF, fontSize: 8.5, color: SLATE, italic: true });

  // fleche pod2 -> PV
  s.addShape(pres.shapes.LINE, { x: 6.7, y: 5.4, w: 0.55, h: 0, line: { color: SLATE, width: 2, endArrowType: "triangle" } });
  // PV
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.3, y: 4.7, w: 2.4, h: 1.45, rectRadius: 0.08, fill: { color: NAVY2 } });
  s.addText("PV / PVC", { x: 7.3, y: 4.8, w: 2.4, h: 0.3, fontFace: HF, fontSize: 12, color: TEAL, bold: true, align: "center" });
  s.addText("hostPath\n/mnt/data/mongo\n2 Gi - RWO", { x: 7.3, y: 5.1, w: 2.4, h: 1.0, fontFace: MF, fontSize: 9, color: "FFFFFF", align: "center" });

  // Pod 3 - monitoring
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.95, y: 2.05, w: 2.75, h: 2.0, rectRadius: 0.08, fill: { color: LIGHT }, line: { color: TEAL, width: 1.25 } });
  s.addText("Pod 3 - Monitoring", { x: 10.05, y: 2.15, w: 2.55, h: 0.3, fontFace: HF, fontSize: 12, color: TEAL, bold: true });
  s.addText([{ text: "Prometheus : 9090", options: { breakLine: true } }, { text: "Grafana : 3000", options: { breakLine: true } }, { text: "scrape backend", options: { breakLine: true } }, { text: "  /metrics", options: {} }], { x: 10.1, y: 2.5, w: 2.55, h: 1.4, fontFace: MF, fontSize: 9.5, color: INK, paraSpaceAfter: 3 });

  // legende NodePort monitoring
  s.addText("NodePort 30090 / 30030", { x: 9.95, y: 4.06, w: 2.75, h: 0.3, fontFace: BF, fontSize: 8.5, color: SLATE, align: "center" });

  footer(s, N);
})();

// ============================================================
// SLIDE 4 - CHOIX TECHNIQUES
// ============================================================
(() => {
  N = 4; const s = pres.addSlide();
  header(s, "Stack", "Choix techniques");
  const cols = [
    ["FRONTEND", K8S, ["React 18 + Vite", "Servi par Nginx 1.27", "Build statique multi-stage", "Reverse-proxy /api"]],
    ["BACKEND", TEAL, ["Node.js 20 + Express", "Driver MongoDB officiel", "prom-client (/metrics)", "Retry de connexion DB"]],
    ["DATA / INFRA", NAVY2, ["MongoDB 7.0", "Cluster via kind", "Prometheus + Grafana", "Images Docker locales"]]
  ];
  cols.forEach((c, i) => {
    const x = 0.6 + i * 4.12;
    card(s, x, 1.5, 3.85, 3.2);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 3.85, h: 0.6, fill: { color: c[1] } });
    s.addText(c[0], { x, y: 1.5, w: 3.85, h: 0.6, fontFace: HF, fontSize: 15, color: "FFFFFF", bold: true, align: "center", valign: "middle" });
    s.addText(c[2].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[2].length - 1 } })), { x: x + 0.25, y: 2.25, w: 3.4, h: 2.3, fontFace: BF, fontSize: 13, color: INK, paraSpaceAfter: 10 });
  });
  // bandeau justification
  card(s, 0.6, 4.95, 12.1, 1.75, NAVY);
  s.addText("Pourquoi ces choix ?", { x: 0.85, y: 5.08, w: 11.6, h: 0.35, fontFace: HF, fontSize: 14, color: TEAL, bold: true });
  s.addText([
    { text: "Stack JavaScript homogene (front + back) - courbe d'apprentissage reduite, demo rapide.", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "MongoDB : schema flexible, ideal pour un catalogue produits + commandes.", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "kind : cluster 100% scriptable et reproductible, sans dependance a une infra cloud.", options: { bullet: true, color: "FFFFFF" } }
  ], { x: 0.85, y: 5.45, w: 11.6, h: 1.2, fontFace: BF, fontSize: 12.5, paraSpaceAfter: 5 });
  footer(s, N);
})();

// ============================================================
// SLIDE 5 - CONTENEURS DOCKER
// ============================================================
(() => {
  N = 5; const s = pres.addSlide();
  header(s, "Conteneurisation", "Images & Dockerfiles");
  // backend
  card(s, 0.6, 1.5, 6.0, 3.7);
  s.addText("Backend - Dockerfile", { x: 0.85, y: 1.62, w: 5.5, h: 0.35, fontFace: HF, fontSize: 15, color: K8S, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 2.05, w: 5.5, h: 3.0, fill: { color: NAVY } });
  s.addText([
    { text: "FROM node:20-alpine", options: { breakLine: true } },
    { text: "WORKDIR /app", options: { breakLine: true } },
    { text: "COPY package.json ./", options: { breakLine: true } },
    { text: "RUN npm install --omit=dev", options: { breakLine: true } },
    { text: "COPY server.js ./", options: { breakLine: true } },
    { text: "EXPOSE 3000", options: { breakLine: true } },
    { text: 'CMD ["node", "server.js"]', options: {} }
  ], { x: 1.0, y: 2.2, w: 5.2, h: 2.7, fontFace: MF, fontSize: 12, color: "9FE2FF", lineSpacingMultiple: 1.15 });
  // frontend
  card(s, 6.75, 1.5, 5.95, 3.7);
  s.addText("Frontend - Multi-stage", { x: 7.0, y: 1.62, w: 5.5, h: 0.35, fontFace: HF, fontSize: 15, color: K8S, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 2.05, w: 5.45, h: 3.0, fill: { color: NAVY } });
  s.addText([
    { text: "# build", options: { breakLine: true, color: TEAL } },
    { text: "FROM node:20-alpine AS build", options: { breakLine: true } },
    { text: "RUN npm install && npm run build", options: { breakLine: true } },
    { text: "# runtime", options: { breakLine: true, color: TEAL } },
    { text: "FROM nginx:1.27-alpine", options: { breakLine: true } },
    { text: "COPY --from=build /app/dist  ...", options: { breakLine: true } },
    { text: "COPY nginx.conf  ...", options: {} }
  ], { x: 7.15, y: 2.2, w: 5.15, h: 2.7, fontFace: MF, fontSize: 11.5, color: "9FE2FF", lineSpacingMultiple: 1.15 });
  // stats images
  const stats = [["ecommerce-backend", "57 MB"], ["ecommerce-frontend", "21 MB"], ["multi-stage", "-90% taille"]];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 4.12;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 5.45, w: 3.85, h: 1.2, fill: { color: CARD }, line: { color: LINE, width: 1 }, shadow: shadow() });
    s.addText(st[1], { x, y: 5.6, w: 3.85, h: 0.55, fontFace: HF, fontSize: 22, color: K8S, bold: true, align: "center" });
    s.addText(st[0], { x, y: 6.15, w: 3.85, h: 0.4, fontFace: MF, fontSize: 11, color: SLATE, align: "center" });
  });
  footer(s, N);
})();

// ============================================================
// SLIDE 6 - CLUSTER KUBERNETES
// ============================================================
(() => {
  N = 6; const s = pres.addSlide();
  header(s, "Orchestration", "Le cluster Kubernetes (kind)");
  card(s, 0.6, 1.5, 6.0, 2.5);
  s.addText("Creation du cluster", { x: 0.85, y: 1.62, w: 5.5, h: 0.35, fontFace: HF, fontSize: 15, color: K8S, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 2.05, w: 5.5, h: 1.05, fill: { color: NAVY } });
  s.addText("$ kind create cluster \\\n    --config kind-config.yaml", { x: 1.0, y: 2.18, w: 5.2, h: 0.8, fontFace: MF, fontSize: 12.5, color: "9FE2FF" });
  s.addText([
    { text: "Kubernetes-in-Docker : le noeud est un conteneur.", options: { breakLine: true, bullet: true } },
    { text: "Mapping NodePort -> localhost (30080 / 30090 / 30030).", options: { bullet: true } }
  ], { x: 0.95, y: 3.2, w: 5.4, h: 0.7, fontFace: BF, fontSize: 12, color: INK, paraSpaceAfter: 4 });

  card(s, 6.75, 1.5, 5.95, 2.5);
  s.addText("kubectl get nodes", { x: 7.0, y: 1.62, w: 5.5, h: 0.35, fontFace: HF, fontSize: 15, color: K8S, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 2.05, w: 5.45, h: 1.75, fill: { color: "101826" } });
  s.addText([
    { text: "NAME                      STATUS  ROLES", options: { breakLine: true, color: "C8D6E5" } },
    { text: "ecommerce-control-plane   Ready   control-plane", options: { breakLine: true, color: GREEN } },
    { text: "", options: { breakLine: true } },
    { text: "v1.32.2  |  label tier=storage", options: { color: TEAL } }
  ], { x: 7.15, y: 2.2, w: 5.15, h: 1.45, fontFace: MF, fontSize: 10.5 });

  // pourquoi kind
  card(s, 0.6, 4.25, 12.1, 2.45, NAVY);
  s.addText("Image locale -> cluster (sans registry)", { x: 0.85, y: 4.38, w: 11.6, h: 0.35, fontFace: HF, fontSize: 14, color: TEAL, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 4.8, w: 11.6, h: 0.95, fill: { color: "081427" } });
  s.addText("$ docker build -t ecommerce-backend:1.0 ./backend\n$ kind load docker-image ecommerce-backend:1.0 --name ecommerce", { x: 1.0, y: 4.9, w: 11.3, h: 0.8, fontFace: MF, fontSize: 12.5, color: "9FE2FF" });
  s.addText("imagePullPolicy: IfNotPresent  ->  pas de pull externe, demarrage instantane.", { x: 0.85, y: 5.95, w: 11.6, h: 0.5, fontFace: BF, fontSize: 12.5, color: "CADCFC", italic: true });
  footer(s, N);
})();

// ============================================================
// SLIDE 7 - PODS & DEPLOYMENTS
// ============================================================
(() => {
  N = 7; const s = pres.addSlide();
  header(s, "Workloads", "Pods, Deployments & sondes");
  s.addTable([
    [
      { text: "Deployment", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Conteneurs", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Replicas", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Strategie", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Sondes", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }
    ],
    ["frontend", "nginx (React)", "2", "RollingUpdate", "liveness + readiness /healthz"],
    ["backend-db", "backend + mongo", "1", "Recreate", "http /api/health + mongosh ping"],
    ["monitoring", "prometheus + grafana", "1", "RollingUpdate", "readiness /-/ready + /api/health"]
  ], { x: 0.6, y: 1.5, w: 12.1, colW: [2.2, 2.9, 1.2, 2.3, 3.5], rowH: [0.5, 0.7, 0.7, 0.7], fontFace: BF, fontSize: 12, color: INK, border: { pt: 1, color: LINE }, valign: "middle", align: "left" });

  card(s, 0.6, 4.5, 5.9, 2.2);
  s.addText("Bonnes pratiques appliquees", { x: 0.85, y: 4.62, w: 5.4, h: 0.35, fontFace: HF, fontSize: 14, color: K8S, bold: true });
  s.addText([
    { text: "requests / limits CPU & memoire sur chaque conteneur", options: { breakLine: true, bullet: true } },
    { text: "Sondes liveness + readiness (auto-healing)", options: { breakLine: true, bullet: true } },
    { text: "Labels coherents (app, tier) pour le routage des Services", options: { bullet: true } }
  ], { x: 0.95, y: 5.0, w: 5.4, h: 1.55, fontFace: BF, fontSize: 12, color: INK, paraSpaceAfter: 7 });

  card(s, 6.65, 4.5, 6.05, 2.2);
  s.addText("Pourquoi Recreate sur Pod 2 ?", { x: 6.9, y: 4.62, w: 5.5, h: 0.35, fontFace: HF, fontSize: 14, color: K8S, bold: true });
  s.addText([
    { text: "Le volume MongoDB est en ReadWriteOnce.", options: { breakLine: true, bullet: true } },
    { text: "Un seul Pod peut monter le volume a la fois.", options: { breakLine: true, bullet: true } },
    { text: "Recreate : on arrete l'ancien Pod avant de creer le nouveau -> pas de conflit de montage.", options: { bullet: true } }
  ], { x: 7.0, y: 5.0, w: 5.5, h: 1.55, fontFace: BF, fontSize: 12, color: INK, paraSpaceAfter: 7 });
  footer(s, N);
})();

// ============================================================
// SLIDE 8 - SERVICES & COMMUNICATION
// ============================================================
(() => {
  N = 8; const s = pres.addSlide();
  header(s, "Reseau", "Services & communication");
  const rows = [
    ["frontend-service", "NodePort", "30080 -> 80", "Acces public au frontend"],
    ["backend-service", "ClusterIP", "3000", "Backend joignable en interne"],
    ["prometheus-service", "NodePort", "30090 -> 9090", "UI Prometheus (bonus)"],
    ["grafana-service", "NodePort", "30030 -> 3000", "Dashboards Grafana (bonus)"]
  ];
  s.addTable([
    [
      { text: "Service", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Type", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Port", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Role", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }
    ],
    ...rows.map(r => [{ text: r[0], options: { fontFace: MF, color: K8S } }, r[1], { text: r[2], options: { fontFace: MF } }, r[3]])
  ], { x: 0.6, y: 1.5, w: 12.1, colW: [3.0, 1.8, 2.6, 4.7], rowH: 0.55, fontFace: BF, fontSize: 12.5, color: INK, border: { pt: 1, color: LINE }, valign: "middle" });

  card(s, 0.6, 4.55, 12.1, 2.15, NAVY);
  s.addText("Chaine de communication", { x: 0.85, y: 4.68, w: 11.6, h: 0.35, fontFace: HF, fontSize: 14, color: TEAL, bold: true });
  // flow chips (5 etapes, rangee centree pour eviter tout debordement)
  const flow = ["Navigateur", "Nginx (Pod 1)", "backend-service", "Backend (Pod 2)", "MongoDB"];
  const SEP = 0.42;
  const widths = flow.map(f => 0.4 + f.length * 0.10);
  const total = widths.reduce((a, b) => a + b, 0) + SEP * (flow.length - 1);
  let fx = 0.85 + (11.6 - total) / 2;
  flow.forEach((f, i) => {
    const w = widths[i];
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: fx, y: 5.25, w, h: 0.5, rectRadius: 0.1, fill: { color: i % 2 ? NAVY2 : K8S } });
    s.addText(f, { x: fx, y: 5.25, w, h: 0.5, fontFace: BF, fontSize: 11, color: "FFFFFF", align: "center", valign: "middle", bold: true });
    fx += w;
    if (i < flow.length - 1) { s.addText(">", { x: fx, y: 5.25, w: SEP, h: 0.5, fontFace: HF, fontSize: 16, color: TEAL, align: "center", valign: "middle", bold: true }); fx += SEP; }
  });
  s.addText("Reverse-proxy Nginx (/api) : une seule origine cote navigateur, pas de CORS. MongoDB joint via localhost dans le Pod 2.", { x: 0.85, y: 5.95, w: 11.6, h: 0.5, fontFace: BF, fontSize: 12.5, color: "CADCFC", italic: true });
  footer(s, N);
})();

// ============================================================
// SLIDE 9 - PERSISTANCE & SECRETS
// ============================================================
(() => {
  N = 9; const s = pres.addSlide();
  header(s, "Donnees & securite", "Persistance (PV/PVC) & Secrets");
  // PV/PVC flow
  card(s, 0.6, 1.5, 6.0, 3.0);
  s.addText("Persistance MongoDB", { x: 0.85, y: 1.62, w: 5.5, h: 0.35, fontFace: HF, fontSize: 15, color: K8S, bold: true });
  const pv = [["PersistentVolume", "hostPath 2 Gi, reclaim Retain"], ["PersistentVolumeClaim", "RWO, lie au PV (storageClass manual)"], ["volumeMount", "/data/db dans le conteneur mongo"]];
  pv.forEach((p, i) => {
    const y = 2.1 + i * 0.78;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y, w: 5.5, h: 0.66, fill: { color: LIGHT }, line: { color: LINE, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y, w: 0.08, h: 0.66, fill: { color: K8S } });
    s.addText(p[0], { x: 1.05, y: y + 0.05, w: 5.2, h: 0.3, fontFace: HF, fontSize: 12.5, color: INK, bold: true });
    s.addText(p[1], { x: 1.05, y: y + 0.33, w: 5.2, h: 0.3, fontFace: BF, fontSize: 10.5, color: SLATE });
  });

  // Secrets
  card(s, 6.75, 1.5, 5.95, 3.0);
  s.addText("Secrets (bonus securite)", { x: 7.0, y: 1.62, w: 5.5, h: 0.35, fontFace: HF, fontSize: 15, color: TEAL, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 2.05, w: 5.45, h: 1.4, fill: { color: NAVY } });
  s.addText([
    { text: "mongo-credentials", options: { breakLine: true, color: TEAL, bold: true } },
    { text: "  MONGO_USER / MONGO_PASSWORD / MONGO_DB", options: { breakLine: true, color: "9FE2FF" } },
    { text: "grafana-admin", options: { breakLine: true, color: TEAL, bold: true } },
    { text: "  GF_SECURITY_ADMIN_*", options: { color: "9FE2FF" } }
  ], { x: 7.15, y: 2.18, w: 5.15, h: 1.15, fontFace: MF, fontSize: 11 });
  s.addText([
    { text: "Aucun mot de passe en clair dans les Deployments.", options: { breakLine: true, bullet: true } },
    { text: "Injectes via secretKeyRef (variables d'env).", options: { bullet: true } }
  ], { x: 7.1, y: 3.55, w: 5.3, h: 0.85, fontFace: BF, fontSize: 12, color: INK, paraSpaceAfter: 4 });

  // test persistance
  card(s, 0.6, 4.75, 12.1, 1.95, NAVY);
  s.addText("Test de persistance apres redemarrage du Pod", { x: 0.85, y: 4.88, w: 11.6, h: 0.35, fontFace: HF, fontSize: 14, color: TEAL, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 5.3, w: 11.6, h: 1.2, fill: { color: "081427" } });
  s.addText([
    { text: "# 1. passer une commande   2. supprimer le Pod", options: { breakLine: true, color: "C8D6E5" } },
    { text: "$ kubectl delete pod -n ecommerce -l app=backend-db", options: { breakLine: true, color: "9FE2FF" } },
    { text: "# 3. le Deployment recree le Pod, le PVC est remonte  ->  la commande est TOUJOURS la", options: { color: GREEN } }
  ], { x: 1.0, y: 5.42, w: 11.3, h: 1.0, fontFace: MF, fontSize: 11.5, lineSpacingMultiple: 1.2 });
  footer(s, N);
})();

// ============================================================
// SLIDE 10 - DEMONSTRATION FONCTIONNELLE
// ============================================================
(() => {
  N = 10; const s = pres.addSlide();
  header(s, "Validation", "Demonstration fonctionnelle");
  const checks = [
    ["A", "Frontend accessible", "curl localhost:30080/healthz  ->  ok", K8S],
    ["B", "Frontend  ->  Backend", "GET /api/products  ->  liste JSON des produits", TEAL],
    ["C", "Backend  ->  MongoDB", '/api/health  ->  {"db":"connected"}', K8S],
    ["D", "Persistance des donnees", "commande conservee apres delete du Pod", TEAL]
  ];
  checks.forEach((c, i) => {
    const x = 0.6 + (i % 2) * 6.15;
    const y = 1.55 + Math.floor(i / 2) * 1.55;
    card(s, x, y, 5.95, 1.35);
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.32, w: 0.7, h: 0.7, fill: { color: c[3] } });
    s.addText(c[0], { x: x + 0.25, y: y + 0.32, w: 0.7, h: 0.7, fontFace: HF, fontSize: 24, color: "FFFFFF", bold: true, align: "center", valign: "middle" });
    s.addText(c[1], { x: x + 1.15, y: y + 0.22, w: 4.6, h: 0.45, fontFace: HF, fontSize: 15, color: INK, bold: true });
    s.addText(c[2], { x: x + 1.15, y: y + 0.66, w: 4.65, h: 0.55, fontFace: MF, fontSize: 10.5, color: SLATE });
  });
  // bandeau resultat
  card(s, 0.6, 4.8, 12.1, 1.9, "ECFDF5");
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.8, w: 0.12, h: 1.9, fill: { color: GREEN } });
  s.addText("Resultat", { x: 0.95, y: 4.95, w: 11.5, h: 0.4, fontFace: HF, fontSize: 16, color: GREEN, bold: true });
  s.addText([
    { text: "Les 4 verifications imposees passent : accessibilite, communication front<->back, back<->base, et persistance.", options: { breakLine: true, bullet: true, color: INK } },
    { text: "Capture(s) d'ecran a inserer ici (kubectl get all, page e-commerce, page Prometheus Targets UP).", options: { bullet: true, color: AMBER } }
  ], { x: 0.95, y: 5.4, w: 11.5, h: 1.2, fontFace: BF, fontSize: 13, paraSpaceAfter: 6 });
  footer(s, N);
})();

// ============================================================
// SLIDE 11 - BONUS
// ============================================================
(() => {
  N = 11; const s = pres.addSlide();
  header(s, "Pour aller plus loin", "Bonus realises");
  const bonus = [
    ["Secrets", "Credentials MongoDB & Grafana chiffres en base64, injectes via secretKeyRef.", K8S],
    ["Observabilite (Pod 3)", "Prometheus scrape le backend instrumente (prom-client) ; dashboard Grafana pre-provisionne.", TEAL],
    ["Cluster multi-noeuds", "Config kind 1 control-plane + 2 workers disponible ; Pod 2 epingle au noeud tier=storage.", NAVY2]
  ];
  bonus.forEach((b, i) => {
    const y = 1.55 + i * 1.7;
    card(s, 0.6, y, 12.1, 1.5);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.14, h: 1.5, fill: { color: b[2] } });
    s.addText(b[0], { x: 1.0, y: y + 0.2, w: 4.0, h: 1.1, fontFace: HF, fontSize: 19, color: b[2], bold: true, valign: "middle" });
    s.addText(b[1], { x: 5.0, y: y + 0.2, w: 7.5, h: 1.1, fontFace: BF, fontSize: 14, color: INK, valign: "middle" });
  });
  footer(s, N);
})();

// ============================================================
// SLIDE 12 - DIFFICULTES & SOLUTIONS
// ============================================================
(() => {
  N = 12; const s = pres.addSlide();
  header(s, "Retour d'experience", "Difficultes rencontrees & solutions");
  s.addTable([
    [
      { text: "Probleme", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
      { text: "Solution apportee", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }
    ],
    ["Backend connecte avant que MongoDB soit pret", "Boucle de retry (30 x 2s) dans server.js"],
    ["Nginx refuse de demarrer (host not found upstream)", "Resolution DNS paresseuse + resolver injecte au runtime"],
    ["Volume RWO bloque le rolling update", "strategy: Recreate sur le Deployment Pod 2"],
    ["CORS entre frontend et backend", "Reverse-proxy /api cote Nginx (meme origine)"],
    ["Images locales absentes du cluster", "kind load docker-image + IfNotPresent"],
    ["Docker Desktop crash (Inference manager / socket)", "Desactivation Docker AI + wsl --shutdown (sockets liberes)"],
    ["Cluster instable (RAM hote limitee)", "Repli mono-noeud + liberation de RAM"]
  ], { x: 0.6, y: 1.5, w: 12.1, colW: [5.6, 6.5], rowH: 0.6, fontFace: BF, fontSize: 12, color: INK, border: { pt: 1, color: LINE }, valign: "middle", fill: { color: CARD } });
  footer(s, N);
})();

// ============================================================
// SLIDE 13 - CONCLUSION & AMELIORATIONS
// ============================================================
(() => {
  N = 13; const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.7, w: 0.14, h: 1.0, fill: { color: K8S } });
  s.addText("Conclusion", { x: 0.95, y: 0.7, w: 11, h: 1.0, fontFace: HF, fontSize: 34, color: "FFFFFF", bold: true });

  card(s, 0.6, 1.95, 6.0, 3.0, NAVY2);
  s.addText("Ce que nous avons livre", { x: 0.85, y: 2.08, w: 5.5, h: 0.4, fontFace: HF, fontSize: 16, color: TEAL, bold: true });
  s.addText([
    { text: "Application e-commerce 3-tiers conteneurisee", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "Architecture imposee respectee (Pod 1 / Pod 2)", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "Persistance PV/PVC validee apres redemarrage", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "Secrets, Services, ConfigMaps, sondes", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "Bonus : monitoring, multi-noeuds, secrets", options: { bullet: true, color: "FFFFFF" } }
  ], { x: 0.95, y: 2.55, w: 5.5, h: 2.3, fontFace: BF, fontSize: 13.5, paraSpaceAfter: 8 });

  card(s, 6.75, 1.95, 5.95, 3.0, NAVY2);
  s.addText("Pistes d'amelioration", { x: 7.0, y: 2.08, w: 5.5, h: 0.4, fontFace: HF, fontSize: 16, color: TEAL, bold: true });
  s.addText([
    { text: "Ingress Controller + TLS (HTTPS)", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "Horizontal Pod Autoscaler (HPA)", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "StatefulSet + replica set MongoDB", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "Pipeline CI/CD (GitHub Actions)", options: { breakLine: true, bullet: true, color: "FFFFFF" } },
    { text: "Packaging Helm + NetworkPolicy", options: { bullet: true, color: "FFFFFF" } }
  ], { x: 7.1, y: 2.55, w: 5.5, h: 2.3, fontFace: BF, fontSize: 13.5, paraSpaceAfter: 8 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.85, w: PW, h: 1.65, fill: { color: "081427" } });
  s.addText("Merci de votre attention", { x: 0.6, y: 6.05, w: 9, h: 0.7, fontFace: HF, fontSize: 26, color: "FFFFFF", bold: true });
  s.addText("Questions & demonstration live", { x: 0.6, y: 6.75, w: 9, h: 0.4, fontFace: BF, fontSize: 14, color: TEAL });
  s.addText("github.com/<equipe>/k8s-ecommerce", { x: 8.5, y: 6.4, w: 4.2, h: 0.5, fontFace: MF, fontSize: 12, color: "CADCFC", align: "right" });
})();

pres.writeFile({ fileName: "presentation/K8s-ECommerce-Presentation.pptx" }).then(f => console.log("OK:", f));
