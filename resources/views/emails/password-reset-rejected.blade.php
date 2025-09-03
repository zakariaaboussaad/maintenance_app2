<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Demande de réinitialisation rejetée</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #ef4444;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
        }
        .reason-box {
            background-color: #fecaca;
            color: #991b1b;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ef4444;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>❌ Demande rejetée</h1>
    </div>
    
    <div class="content">
        <p>Bonjour <strong>{{ $userName }}</strong>,</p>
        
        <p>Votre demande de réinitialisation de mot de passe a été <strong>rejetée</strong> par {{ $adminName }}.</p>
        
        @if($rejectionReason)
        <div class="reason-box">
            <strong>Raison du rejet :</strong><br>
            {{ $rejectionReason }}
        </div>
        @endif
        
        <p>Pour obtenir de l'aide, veuillez contacter directement l'administrateur ou soumettre une nouvelle demande avec plus d'informations.</p>
        
        <p>Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à contacter le support technique.</p>
    </div>
    
    <div class="footer">
        <p>Système de Maintenance - Email automatique</p>
        <p>{{ now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>
