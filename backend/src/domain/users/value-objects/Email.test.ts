import { Email } from "./Email.ts"

// `describe` agrupa los tests de una misma unidad. Es solo organización:
// cuando algo falle, la salida de Jest te dirá "Email > debería ...".
describe("Email (value object)", () => {

  // CASO FELIZ: el comportamiento esperado cuando todo va bien.
  it("acepta un email con formato válido y lo expone con getValue()", () => {
    // Arrange: preparamos la entrada.
    const input = "energy.rex.2003@gmail.com"

    // Act: ejecutamos la unidad bajo prueba.
    const email = new Email(input)

    // Assert: verificamos el resultado observable.
    // Solo podemos comprobar lo que el objeto expone (getValue), nunca el
    // campo privado `value`. Probamos el CONTRATO, no la implementación.
    expect(email.getValue()).toBe(input)
  })

  // CASO DE ERROR: igual de importante que el feliz. Aquí documentamos que
  // el constructor DEBE rechazar entradas inválidas.
  it("lanza un error si el email no cumple el patrón", () => {
    // OJO: la llamada va dentro de una función `() => ...`.
    // Si pusiéramos `expect(new Email("malo"))` el error se lanzaría ANTES
    // de que expect pudiera capturarlo y el test reventaría en vez de pasar.
    expect(() => new Email("esto-no-es-un-email")).toThrow()
  })

  // `it.each` ejecuta el mismo test con varias entradas: una tabla de casos.
  // Es la forma idiomática de cubrir muchos ejemplos sin repetir código.
  it.each([
    "sinarroba.com",
    "sin@dominio",
    "@gmail.com",
    "",
  ])("rechaza el email inválido: '%s'", (invalido) => {
    expect(() => new Email(invalido)).toThrow()
  })
})
