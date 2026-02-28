declare module "*.css";
// For CSS modules specifically, you might use:
declare module "*.module.css" {
  const styles: { [key: string]: string };
  export default styles;
}
