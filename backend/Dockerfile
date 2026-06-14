FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore ./src/DataEngineerInterviewMaster.Api/DataEngineerInterviewMaster.Api.csproj
RUN dotnet publish ./src/DataEngineerInterviewMaster.Api/DataEngineerInterviewMaster.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "DataEngineerInterviewMaster.Api.dll"]
