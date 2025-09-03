<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mot de passe réinitialisé</title>
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
            background-color: #3b82f6;
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
        .password-box {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            border: 2px solid #3b82f6;
        }
        .warning {
            background-color: #fef3c7;
            color: #92400e;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
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
        <h1>🔑 Mot de passe réinitialisé</h1>
    </div>
    
    <div class="content">
        <p>Bonjour <strong>{{ $userName }}</strong>,</p>
        
        <p>Votre demande de réinitialisation de mot de passe a été <strong>approuvée</strong> par {{ $adminName }}.</p>
        
        <p>Voici votre nouveau mot de passe temporaire :</p>
        
        <div class="password-box">
            {{ $newPassword }}
        </div>
        
        <div class="warning">
            <strong>⚠️ Important :</strong>
            <ul>
                <li>Ce mot de passe est temporaire</li>
                <li>Changez-le dès votre première connexion</li>
                <li>Ne partagez jamais ce mot de passe</li>
                <li>Supprimez cet email après utilisation</li>
            </ul>
        </div>
        
        <p>Vous pouvez maintenant vous connecter à l'application avec ce nouveau mot de passe.</p>
        
        <p>Si vous n'avez pas demandé cette réinitialisation, contactez immédiatement l'administrateur.</p>
    </div>
    
    <div class="footer">
        <p>Système de Maintenance - Email automatique</p>
        <p>{{ now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>
