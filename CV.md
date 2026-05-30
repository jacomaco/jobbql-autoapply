const cvFile = Bun.file('./test_cv_typescript.md')

async function f() {
  const text = await cvFile.text()
  console.log(text)
}

f()
