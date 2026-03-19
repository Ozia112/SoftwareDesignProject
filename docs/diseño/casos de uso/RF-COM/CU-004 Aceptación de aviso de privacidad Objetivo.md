##CU-COM-004 Aceptación de aviso de privacidad

##Objetivo

-Garantizar que el lead otorgue su consentimiento antes de interactuar con el sistema, cumpliendo con las políticas de privacidad.

##Actores
##Actor principal

Lead

##Actores secundarios

##Sistema

##Precondiciones

El sistema está disponible para iniciar conversación.
El aviso de privacidad y términos están configurados en el sistema.

##Flujo principal

-El lead inicia la conversación con el sistema.
-El sistema muestra el aviso de privacidad y términos y condiciones.
-El sistema solicita la aceptación del aviso.
-El lead selecciona "Acepto".
-El sistema registra el consentimiento.
-El sistema permite continuar la interacción.

Flujos alternos
-A1. Rechazo del aviso
-El lead selecciona "No acepto".
-El sistema informa que no puede continuar sin consentimiento.
-El sistema finaliza la interacción.

##Postcondiciones
En éxito
El consentimiento del lead queda registrado en el sistema.
El lead puede continuar la interacción.
En fallo
La interacción es bloqueada por falta de consentimiento.

##Excepciones
-E1. Error al registrar consentimiento
-Ocurre un fallo al guardar el consentimiento.
-El sistema no permite continuar la interacción.
-Se notifica el error al lead.