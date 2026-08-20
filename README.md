<div align="center">

# SmartParking

**공영 무료 주차장 예약 서비스**

무료 주차장의 자리 경쟁 문제를 예약 시스템으로 해결하는 프로젝트

</div>

---

## 왜 만들었나

공영 무료 주차장은 선착순으로 운영되어 자리를 확보하기 어렵고, 방문 전에는 빈자리 여부를 알 수 없습니다. SmartParking은 **주차면 단위 예약**으로 이 문제를 해결하고, 관리자에게는 주차장·예약 현황을 한눈에 관리할 수 있는 대시보드를 제공합니다.

## 주요 기능

| 기능 | 설명 |
|---|---|
| 🅿️ **주차면 예약** | 주차장·주차면 조회 후 원하는 시간대에 예약 |
| ⏰ **예약 자동 만료** | 스케줄러가 만료된 예약을 자동 정리해 주차면 회전율 유지 |
| 📋 **예약 내역 조회** | 사용자별 예약 이력 확인 |
| 🔐 **세션 기반 인증** | 회원가입·로그인, 인터셉터 기반 접근 제어 |
| 🛠️ **관리자 대시보드** | 주차장·주차면·예약·회원 관리 |

## 기술 스택

| 영역 | 스택 |
|---|---|
| Backend | Java 17, Spring Boot, Spring Security, JPA (Hibernate) |
| Frontend | React 19, TypeScript, Vite, React Router |
| Database | MySQL |
| Test | JUnit 5, H2 |

## 실행 방법

### Backend

`src/main/resources/application.properties`를 생성하고 DB 접속 정보를 설정합니다:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartparking
spring.datasource.username=<username>
spring.datasource.password=<password>
spring.jpa.hibernate.ddl-auto=update
```

```bash
./gradlew bootRun
```

### Frontend

```bash
cd smartParkingFrontend
npm install
npm run dev
```

## 프로젝트 구조

```
├── src/main/java/.../smartParking/
│   ├── controller/     # 예약·주차면·회원·관리자 REST API
│   ├── service/        # 비즈니스 로직, 예약 만료 스케줄러
│   ├── entity/         # User, ParkingLot, ParkingSpot, Reservation
│   ├── security/       # Spring Security 설정
│   ├── interceptor/    # 세션 기반 접근 제어
│   └── repository/     # JPA 리포지토리
└── smartParkingFrontend/   # React + Vite 클라이언트
    └── pages/          # 로그인, 사용자·관리자 대시보드, 예약 내역
```
