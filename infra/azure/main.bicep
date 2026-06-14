param location string = resourceGroup().location
param environmentName string = 'deim'

resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${environmentName}-cae'
  location: location
  properties: {}
}

output containerAppsEnvironmentId string = containerAppsEnv.id

