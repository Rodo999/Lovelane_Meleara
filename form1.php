<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST["nombre"];
    $producto = $_POST["producto"];
    $atencion = $_POST["atencion"];
    $calidad = $_POST["calidad"];
    $recomendarias = $_POST["recomendarias"];
    $comentarios = $_POST["comentarios"];

    $to = "rodolfoalexis45@gmail.com"; 
    $subject = "🌸 Nueva Encuesta de Atención - Lovelane Meleara";

    $message = "
    📋 Encuesta de atención recibida:

    👤 Nombre: $nombre
    🌹 Producto comprado: $producto
    🤝 Atención recibida: $atencion
    💐 Calidad del producto: $calidad
    ⭐ ¿Recomendaría Lovelane Meleara?: $recomendarias
    📝 Comentarios: $comentarios
    ";

    $headers = "From: noreply@tusitio.com\r\n";
    $headers .= "Reply-To: noreply@tusitio.com\r\n";

    if (mail($to, $subject, $message, $headers)) {
        echo "<h2>✅ ¡Gracias por tu tiempo! Tu opinión nos ayuda a mejorar 💖</h2>";
    } else {
        echo "<h2>❌ Hubo un error al enviar la encuesta. Intenta nuevamente.</h2>";
    }
}
?>
