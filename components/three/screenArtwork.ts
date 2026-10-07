import * as THREE from "three";

export type ScreenMode = "preview" | "broken" | "phone";

/** Original screen mounting follows React Widgets; these are illustrative UI
 * previews, not claims that the coming-soon editor is already available. */
export function makeScreenArtwork(mode: ScreenMode) {
  const canvas = document.createElement("canvas");
  const phone = mode === "phone";
  canvas.width = phone ? 480 : 1440;
  canvas.height = phone ? 1040 : 980;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const draw = () => {
    const heading = getComputedStyle(document.querySelector("h1") || document.body).fontFamily;
    const body = getComputedStyle(document.body).fontFamily;
    // The supplied display face is extended; fit lettering to each source screen.
    const displayText = (text: string, x: number, y: number, size: number, maxWidth: number) => {
      ctx.font = `400 ${size}px ${heading}`;
      const width = ctx.measureText(text).width;
      if (width > maxWidth) ctx.font = `400 ${size * maxWidth / width}px ${heading}`;
      ctx.fillText(text, x, y);
    };
    ctx.fillStyle = "#101112"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#EEECE7"; ctx.font = `500 ${phone ? 24 : 28}px ${body}`;
    ctx.fillText("SleekViber", phone ? 38 : 38, phone ? 60 : 52);
    if (phone) {
      ctx.fillStyle = "#EEECE7";
      displayText("Welcome", 38, 235, 68, 404); displayText("back.", 38, 304, 68, 404);
      ctx.fillStyle = "#B7B5B1"; ctx.font = `400 24px ${body}`;
      ctx.fillText("Your work. Your access.", 38, 372);
      ctx.fillStyle = "#242628";
      ctx.beginPath(); ctx.roundRect(38, 440, 404, 106, 14); ctx.fill();
      ctx.fillStyle = "#EEECE7"; ctx.font = `400 24px ${body}`;
      ctx.fillText("Email address", 62, 502);
      ctx.fillStyle = "#EEECE7";
      ctx.beginPath(); ctx.roundRect(38, 566, 404, 92, 46); ctx.fill();
      ctx.fillStyle = "#101112"; ctx.font = `500 26px ${body}`;
      ctx.fillText("Continue with a passkey", 65, 621);
      ctx.fillStyle = "#B7B5B1"; ctx.font = `400 22px ${body}`;
      ctx.fillText("Identity", 38, 754); ctx.fillText("Permissions", 38, 812);
      ctx.fillText("Protected by design", 38, 928);
    } else {
      // A real design preview replaces the old three-label placeholder panel.
      ctx.fillStyle = "#B7B5B1"; ctx.font = `400 22px ${body}`;
      ctx.fillText(mode === "broken" ? "Unfinished preview" : "Website concept", 1125, 52);
      ctx.fillStyle = "#191B1D"; ctx.fillRect(0, 90, 230, 890);
      ctx.fillStyle = "#EEECE7"; ctx.font = `500 25px ${body}`;
      ctx.fillText("Your project", 30, 146);
      ctx.fillStyle = "#B7B5B1"; ctx.font = `400 23px ${body}`;
      ["Design", "Pages", "Data", "Access"].forEach((label, i) => ctx.fillText(label, 30, 219 + i * 68));
      ctx.fillText("Interface concept", 30, 927);
      ctx.fillStyle = "#EEECE7"; ctx.fillRect(256, 116, 1158, 838);
      ctx.fillStyle = "#101112"; ctx.font = `500 27px ${body}`;
      ctx.fillText("Form & Field", 300, 177);
      ctx.font = `400 22px ${body}`; ctx.fillText("Work", 1167, 177); ctx.fillText("Contact", 1263, 177);
      displayText("Ideas", 296, 374, 145, 1074); displayText("into form.", 296, 509, 145, 1074);
      ctx.fillStyle = "#545654"; ctx.font = `400 26px ${body}`;
      ctx.fillText("Digital experiences with a point of view.", 300, 579);
      ctx.fillStyle = "#101112";
      ctx.beginPath(); ctx.roundRect(300, 625, 235, 67, 34); ctx.fill();
      ctx.fillStyle = "#EEECE7"; ctx.font = `500 25px ${body}`; ctx.fillText("Explore the work", 326, 668);
      // Typographic project composition, not an invented 3D illustration.
      ctx.fillStyle = "#242628"; ctx.fillRect(300, 758, 1070, 150);
      ctx.fillStyle = "#C8CDD0"; displayText("MAKE IT MATTER.", 325, 873, 112, 1020);
      if (mode === "broken") {
        ctx.fillStyle = "#242628"; ctx.fillRect(832, 298, 566, 282);
        ctx.fillStyle = "#EEECE7";
        displayText("Something went wrong.", 858, 367, 40, 514);
        ctx.fillStyle = "#B7B5B1"; ctx.font = `400 26px ${body}`;
        ctx.fillText("This route is not connected.", 858, 420);
        ctx.fillText("Your changes were not saved.", 858, 465);
      }
    }
    texture.needsUpdate = true;
  };
  draw();
  let disposed = false;
  void document.fonts.ready.then(() => { if (!disposed) draw(); });
  return { texture, dispose: () => { disposed = true; texture.dispose(); } };
}
