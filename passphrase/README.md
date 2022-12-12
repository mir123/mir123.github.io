# readablePassphraseJS-ES

Una adaptación al español de readablePassphraseJS por Steven Zeck, el cual a su vez es una implementación en Javascript del readable passphrase generator de Murray Grant.

Este programa genera oraciones aleatorias en español que pueden funcionar mejor que palabras clave y ser más fáciles de recordar.

Este software está en desarrollo pero ya se puede ver [aquí](http://mirrodriguezlombardo.com/passphrase/).

# Las **frases fuertes**

Una "frase fuerte" funciona igual que una contraseña pero es mucho más segura y fácil de recordar.

Cada vez que te registras en una aplicación, servicio o sitio web te piden usar un nombre de usuario y un password o contraseña. Desafortunadamente se ha vuelto casi imposible crear contraseñas realmente seguras y que al mismo tiempo sean fáciles de recordar.

Hay algunas posibles soluciones:

- Usar un gestor de claves como [Keepass](https://keepass.info/), [LastPass](https://www.lastpass.com/) o tu [navegador](https://www.mozilla.org/en-US/firefox/features/password-manager/). Te pueden ayudar a crear contraseñas seguras, como `yn5rCS9W6y1nX34j`, y encargarse de recordarlas cada vez que visitas alguna aplicación
- Configurar un sistema de verificación de dos factores (2FA, le dicen) que te envíe un código a tu teléfono o por email para poder entrar
- Usar una [llave física](https://www.yubico.com/) que introduces en el USB cada vez que necesitas autenticarte
- Crear una frase fuerte que puedas recordar

Una contraseña como la que menciono en el punto 1 podría ser casi imposible de adivinar. Desafortunadamente la mayoría de nosotros usamos contraseñas súper inseguras. Un alto porcentaje de las personas usan `123456`, `querty` o `password` como palabra secreta para proteger sus cuentas. Algunos reemplazamos letras por números, como `Aut0m0v1l3s`. Estas contraseñas son muy fáciles de adivinar por alguien que quiera entrar sin autorización (hackear) tu cuenta de redes sociales, tu email o alguna aplicación que uses.

Aquí es dónde entra el concepto de "frases fuertes" o frases contraseña, donde usamos palabras en lugar de letras y números.

- Las frases fuertes son más fáciles de recordar
- Se pueden crear frases fuertes que una son casi imposibles de adivinar

La clásica tira cómica [xkcd](https://xkcd.com/936) lo explica así:

Mi objetivo es generar frases fuertes que sean legibles. Aunque el texto no tenga ningún sentido (si tu cerebro está bueno y sano) tendrá una legibilidad que lo haga más fácil de recordar. Esta frase puedes usarla como la contraseña maestra de tu gestor de contraseñas o directamente en aplicaciones y servicios. El sistema que ves aquí contiene más de 55,000 palabras que se pueden combinar de distintas formas, lo cual lo hace muy seguro. El número de **entropía** te da una indicación de qué tan fuerte es la frase como contraseña. Una frase más larga tendrá una entropía mayor. Un número de 60 o más se considera bastante impenetrable.

Aquí utilizo la [Lista de frecuencia de palabras del español chileno](https://sadowsky.cl/lifcach.html) por Scott Sadowsky y Ricardo Martínez Gamboa, los verbos los conjugué con Python usando la biblioteca [verbecc](https://github.com/bretttolbert/verbecc) de Brett Tolbert. A esta lista le agregué los 1000 nombres panameños más comunes, tomados de una lista que publicó el Tribunal Electoral de Panamá y que es la misma que usé en mi generador de nombres panameños [Yaurisbeth](https://www.yaurisbeth.com/).

Este sistema está basado en el [readablePassphraseJS](https://github.com/xaintly/readablePassphraseJS) de Steven Zeck, basado a su vez en el [Readable Passphrase Generator](https://github.com/ligos/readablepassphrasegenerator) de Murray Grant.
