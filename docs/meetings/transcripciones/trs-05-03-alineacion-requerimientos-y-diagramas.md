# Weekly Equipo 01-20260305_121458 – Grabación de la reunión

**Fecha:** 5 de marzo de 2026, 6:14 p.m.  
**Duración:** 16m 13s

_ISAAC ALEJANDRO ORTIZ ZALDIVAR inició la transcripción_.

**Edgar Cambranes Martinez (0:03):**  
Me perdí un poquitín. ¿Cuántos requisitos funcionales tienen?

**MAXIMILIANO CARRILLO ALVARADO (0:14):**  
Hicimos ocho originalmente, pero luego lo redujimos.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (0:19):**  
Sí, pero también están los de evento.

**MAXIMILIANO CARRILLO ALVARADO (0:22):**  
Sí. Ahora mismo tenemos, creo que 7 funcionales y 7 de eventos al final, ¿no?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (0:31):**  
Sí, esos tambien son funcionales; lo que pasa es que los de evento lo que hacen es como especificar el comportamiento del sistema cuando alguien ya reserva un cupo. Esos son los míos, son los que yo tengo que no alcancé a explicar en la junta.

**MAXIMILIANO CARRILLO ALVARADO (0:57):**  
Bueno, también aquí decimos que, como nos pidió usted en nuestra exposición del sistema del bot, quitamos las métricas de verificación, ajustamos la redacción de requerimientos; sobre todo creo que los que más cambiaron fueron los mios y los de Diego, no estoy seguro.

**MAXIMILIANO CARRILLO ALVARADO (1:21):**  
Igual modificamos, como nos pidió, el requerimiento 2 con el requerimiento, creo que 8. Sí, eran muy similares y los combinamos.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (1:36):**  
La calificación del cliente con el estado del cliente, luego combinamos todo.

**Edgar Cambranes Martinez (1:48):**  
Y en, o sea, no funcionales, ¿estrictamente cuáles hay?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (1:56):**  
Todavía no tenemos no funcionales definidos.

**MAXIMILIANO CARRILLO ALVARADO (1:57):**  
Lo que queremos hacer este mes es definir los no funcionales, aunque sea este el tema de esta y la próxima sesión, para ya poder avanzar con lo demás.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (2:12):**  
Con los módulos de calidad.

**Edgar Cambranes Martinez (2:19):**  
Pero todavía no hay un artefacto que defina el flujo de los funcionales, ¿no?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (2:33):**  
¿Un artefacto que defina el flujo de funcionales, como qué sería?

**Edgar Cambranes Martinez (2:34):**  
Casos de uso, historias de usuario.

**MAXIMILIANO CARRILLO ALVARADO (2:45):**  
Tenemos historias de usuario.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (2:45):**  
Sí, historias de usuario sí tenemos, nomás que nos faltaría agregar algo parecido a casos de uso tipo _pipeline_.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (2:56):**  
Para decir: aquí se activa este, luego pasa esto si ocurre tal cosa; o sea, como caminos, los _happy paths_.

**Edgar Cambranes Martinez (3:03):**  
Bueno, creo que sí tienen que… O sea, ¿tienen 6 funcionales?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (3:14):**  
Tenemos 14 funcionales, creo.

**MAXIMILIANO CARRILLO ALVARADO (3:21):**  
Sí, 14.

**Edgar Cambranes Martinez (3:25):**  
¿Y esa lista dónde está?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (3:29):**  
Por el momento está en el _backlog_.

**MAXIMILIANO CARRILLO ALVARADO (3:29):**  
Ahorita vi, es lo que hizo que creáramos una rama.

**MAXIMILIANO CARRILLO ALVARADO (3:37):**  
Son esos, están en _draft_. Y aquí tenemos los primeros; tenemos 15, pero uno es nuevo.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (3:56):**  
No, esos son los nuevos, los míos de lo que te digo. Son 14.

**Edgar Cambranes Martinez (4:08):**  
¿El _backlog_ dónde está?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (4:11):**  
En _Projects_, ese project. Lo debemos poner en el _Readme_.

**Edgar Cambranes Martinez (4:16):**  
Pero eso veo que tiene cuatro elementos.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (4:19):**  
Sí, porque lo habíamos separado por integrante de equipo. Por eso ahorita lo estamos pasando al repositorio, de manera que cada requerimiento funcional sea un documento individual para que se pueda referenciar de forma atómica.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (4:36):**  
En vez de que referencies a todo el documento, referencias a un solo documento que tiene solo un requerimiento funcional. Pero pues en eso estamos ahorita: creé _issues_ para trabajar en ello en _develop_. Ahorita solo está lo que yo ya entregué y en los _pull requests_ está lo que Max va a entregar. Y lo de Diego, pues tuvimos temas técnicos, entonces estamos intentando solucionarlo para que lo pueda sustituir.

**Edgar Cambranes Martinez (5:17):**  
Bueno, lo de Saúl, decidan si lo van a incluir o lo pueden excluir y ya está.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (5:21):**  
Pues es que lo de Saúl era lo pesado. Entonces queremos meterlo y ver ahora sí qué quitamos para empezar con requerimientos no funcionales.

**MAXIMILIANO CARRILLO ALVARADO (5:26):**  
De hecho, queremos que este requerimiento 2 de Saúl sea la base principal de nuestro proyecto, porque fue el que a usted más le interesó y dijo que era el más pesado.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (5:40):**  
El _core_, sí. O sea, los otros pueden ser requerimientos funcionales complementarios al 2, que restrinjan más que añadan cosas. Por ejemplo, el de eventos es qué pasa cuando alguien ya reservó, o los de información, que son algo adicional de qué pasa dentro de la conversación. Pero el 2, que es el principal, es a nivel general: ¿qué pasa en todo el sistema, en todos los clientes?

**DIEGO ISLAS MERINO (6:40):**  
No se le escucha, profe.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (6:44):**  
Se le escucha raro, profe, con muchísimo eco; se distorsiona su voz.

_(Se presentan problemas de audio; se omiten frases sin sentido por el micrófono)_.

**Edgar Cambranes Martinez (8:18):**  
Lo que sería bueno entonces es que esté sincronizada la información que tienen en el repo contra la que tienen en el proyecto. Y lo que yo les recomendaría ampliamente es que empiecen a hacer diagramas de procesos.

**MAXIMILIANO CARRILLO ALVARADO (8:45):**  
¿Diagramas de procesos de ahí?

**Edgar Cambranes Martinez (8:46):**  
Hay unos que se llaman _business processes_, ahorita les voy a mandar un ejemplo, porque es básicamente una descripción gráfica de lo que representaría cada una de las funcionalidades. Pueden encontrar un montón en internet, ahorita se los coloco. Ahorita se los mando en el chat.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (9:40):**  
¿Pero la idea es básicamente que...?

**Edgar Cambranes Martinez (9:43):**  
Que se documenten vía esos diagramas los procesos.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (9:48):**  
Y que coincidan con los requerimientos funcionales, ¿no?, gráficamente.

**Edgar Cambranes Martinez (10:11):**  
Pues deberian ser practicamente una descripcion mucho mas grafica pero ahi, la diferencia con esos diagramas es que estas viendo que usuario o que actor de sistema esta invlucrado y ya no es solo una descripción meramente textual, porque un caso de uso, por ejemplo, tiene el _Happy Path_ y las excepciones, ¿no? Pero aquí ya te dice: empieza este actor y este otro actor, y ya empiezas a delegar responsabilidades de acuerdo a entidades de tu sistema que ya empiezas a definir. O sea, tiene un nivel de detalle diferente al de un caso de uso.

**Edgar Cambranes Martinez (10:41):**  
O con más detalle, porque en el caso de ustedes tienen historias de usuario y las historias de usuario pueden ser completas o incompletas, o no necesariamente tener toda esta información. Pero al menos irnos hacia allá para empezar a revisar; es una forma muy rápida de revisar cómo va a funcionar todo este sistema.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (11:05):**  
Hay varios tipos, entonces, ¿como cuál?

**Edgar Cambranes Martinez (11:07):**  
Bueno, la que yo les estoy recomendando es una que se llama _Business Process_.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (11:15):**  
¿Es _Business Process Model and Notation_, o hay otro?

**Edgar Cambranes Martinez (11:22):**  
Se llaman _Business Process Diagram_. Entonces hay una especificación muy grande, pero si buscan _Business Process Diagram_ van a encontrar un montón de opciones en la red, pero no es muy diferente de un diagrama de colaboración de UML.

**Edgar Cambranes Martinez (11:41):**  
O sea, tampoco es ser muy estrictos en que es un diagrama estandarizado que le pertenece a UML. Más bien empecemos a bosquejarlos para que puedan tenerlos. Lo otro es que creo que sería bueno que, aunque está bien así el repo en 3 entregas, empecemos a ponerle un poco más de orden, ¿no?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (12:00):**  
Okay. Sí.

**Edgar Cambranes Martinez (12:17):**  
Este… no me molesta tener entregas febrero, marzo, abril; está bien, pero sería bueno que pudiéramos ver más orden en cómo funciona el repo. Porque, por ejemplo, si yo voy a los _commits_, ¿quién está en los _commits_?

**Edgar Cambranes Martinez (12:44):**  
Una sola persona.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (12:46):**  
Ahorita, si nos vamos al _main_, sale que el único contribuidor soy yo, porque yo creé el repositorio, pero cuando haga un _merge_ de la rama _develop_ a _main_ deben salir ya los tres, porque _develop_ es la de integración.

**Edgar Cambranes Martinez (13:03):**  
Okay, pero entonces al menos lo que sí debería suceder es que todos vayan por vía PR (_Pull Request_).

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (13:16):**  
Sí, eso estamos haciendo.

**Edgar Cambranes Martinez (13:18):**  
Y que estén ahí los que sean contribuidores, ¿no? Y que exista entonces una planeación semanal. O sea, debería haber una bitácora que la pueden reflejar directamente en el proyecto.

**Edgar Cambranes Martinez (13:33):**  
Pero sobre todo de tareas de semana a semana, que yo pueda ver qué se supone que debió haber contribuido cada quien.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (13:53):**  
Entonces vamos creando _weekly reports_, ¿no?

**Edgar Cambranes Martinez (13:58):**  
No tiene que ser un reporte, pero sí mi sugerencia es que planeen semanalmente, porque nos vamos a reunir una vez a la semana. Entonces la idea es ver: de lo que se planeó esta semana, ¿qué se cumplió?

**Edgar Cambranes Martinez (14:13):**  
Y que estén pendientes ahí con los integrantes, ¿no?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (14:19):**  
Sí.

**Edgar Cambranes Martinez (14:20):**  
Porque, otra vez, esta reunión no es para que falten integrantes.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (14:30):**  
Sí, somos nosotros, ya no hay más.

**DIEGO ISLAS MERINO (14:32):**  
Solo somos nosotros, profe, no hay más.

**Edgar Cambranes Martinez (14:36):**  
¿Son todos los tres ahora?

**MAXIMILIANO CARRILLO ALVARADO (14:38):**  
Sí.

**DIEGO ISLAS MERINO (14:38):**  
Sí, fue lo que fuimos a decir la vez pasada.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (14:38):**  
Se fue Saúl.

**Edgar Cambranes Martinez (14:43):**  
Bueno, entonces ya. Está bien, no tengo ningún problema por eso.

**Edgar Cambranes Martinez (14:51):**  
Va, pues entonces quiero ver estos artefactos, tanto de la parte de diseño donde están empezando a utilizar este _Business Process Diagram_ para mapear de mejor manera cada una de sus historias de usuario y que quede claro cómo va a funcionar este sistema antes de que empiecen a hacer cualquier cosa de código. Alternativamente, sí creo que deberían empezar a explorar tecnología.

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (15:05):**  
Okay, sí.

**Edgar Cambranes Martinez (15:20):**  
Para saber cómo integrarlo y que esté sincronizado lo que dice el repo. Si quieren dejarlo en febrero, marzo y abril, no tengo problema, pero al menos que haya un índice de qué se supone que pasó o cómo va a avanzar el proyecto; eso podría estar directamente asociado al _Project_ de GitHub.

**Edgar Cambranes Martinez (15:50):**  
Vale, pues, ¿dudas?

**ISAAC ALEJANDRO ORTIZ ZALDIVAR (15:50):**  
Está bien, profe. Por ahora no.

**Edgar Cambranes Martinez (15:55):**  
Bueno, entonces de todas formas nos vemos el lunes, ¿no?

**DIEGO ISLAS MERINO (16:00):**  
Sí.

**MAXIMILIANO CARRILLO ALVARADO (16:01):**  
Sí.

_ISAAC ALEJANDRO ORTIZ ZALDIVAR detuvo la transcripción_.

## Fuentes

- Video de la reunión: [Video de la junta](https://teams.microsoft.com/l/meetingrecap?driveId=b%21AIofdc6CzkOl_D45tzSgSnFYWBdIpTxDsLAX-928piQgJkiZO-_tRp0ZFdFi0_EF&driveItemId=01CJ2MXIO442SHL2VZRRAYDFTXXDUPYTJR&sitePath=https%3A%2F%2Falumnosuady-my.sharepoint.com%2F%3Av%3A%2Fg%2Fpersonal%2Fa24216345_alumnos_uady_mx%2FIQDc5qR16rmMQYGWd7jo_E0xAdtF-bvydyDo2J3XtarJCYY&fileUrl=https%3A%2F%2Falumnosuady-my.sharepoint.com%2Fpersonal%2Fa24216345_alumnos_uady_mx%2FDocuments%2FRecordings%2FWeekly+Equipo+01-20260305_121458-Grabaci%C3%B3n+de+la+reuni%C3%B3n.mp4%3Fweb%3D1&iCalUid=040000008200E00074C5B7101A82E00807EA0305CC6B3C7FC9ACDC010000000000000000100000008A5501F14E53DC4B98D7FADB8A34AA14&masterICalUid=040000008200E00074C5B7101A82E00800000000CC6B3C7FC9ACDC010000000000000000100000008A5501F14E53DC4B98D7FADB8A34AA14&threadId=19%3Ameeting_MTFiZDI1MjEtNGMyZC00ODk2LTkxNjMtYWFhNGI1NDdkZjMy%40thread.v2&organizerId=a3c01b16-e302-4204-801f-8455f00e82b7&tenantId=2b83ac9e-2448-45df-9319-48d86236a5ea&callId=82cb3301-6b97-4b8b-ae8d-3fce4f6b95ee&threadType=Meeting&meetingType=Recurring&subType=RecapSharingLink_RecapCore)

---

> - Transcripción realizada por Microsoft Teams.
> - Revisada y editada por _ISAAC ALEJANDRO ORTIZ ZALDIVAR_
