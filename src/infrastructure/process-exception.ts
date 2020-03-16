export function handleProcessException() {
  process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
  });
  process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
  });
}
